import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { authenticateRequest } from '../../../../../lib/auth';
import { isUserAdmin } from '../../../../../lib/user-roles';

const ALLOWED_METHODS = ['credit', 'debit', 'pix', 'boleto'] as const;

type RouteContext = { params: Promise<{ id: string }> | { id: string } };
type PaymentMethod = (typeof ALLOWED_METHODS)[number];

type PaymentBody = {
  method?: string;
  amount?: number;
  cardBrand?: string;
  cardNumber?: string;
  installments?: number;
};

type OrderSummary = {
  id: number;
  user_id: number;
  status: string;
  grand_total: number;
  payment_method: string | null;
};

function toPositiveNumber(value: unknown): number | null {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return Number(amount.toFixed(2));
}

function toOrderId(params: { id: string }): number | null {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getOrder(orderId: number): Promise<OrderSummary | null> {
  const result = await query<OrderSummary>(
    `SELECT id, user_id, status, grand_total, payment_method
     FROM orders
     WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

function detectCardBrand(cardNumber = ''): string | null {
  const n = String(cardNumber).replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6500|6516|6550)/.test(n)) return 'elo';
  if (/^(6062|6370|6375|38)/.test(n)) return 'hipercard';
  return null;
}

function onlyDigits(value = ''): string {
  return String(value).replace(/\D/g, '');
}

function formatCnpj(value = ''): string {
  const digits = onlyDigits(value).slice(0, 14).padStart(14, '0');
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function generateBoletoMetadata(orderId: number, amount: number): Record<string, unknown> {
  const now = Date.now();
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const fakeCnpjDigits = '03.361.252/0004-87';
  const amountInCents = String(Math.round(Number(amount || 0) * 100)).padStart(10, '0');
  const bankCode = '001';
  const currencyCode = '9';
  const dueFactor = '9727';
  const freeField = `${String(orderId).padStart(6, '0')}${String(now).slice(-14)}`.slice(0, 25);
  const barcode = `${bankCode}${currencyCode}${dueFactor}${amountInCents}${freeField}`;

  return {
    type: 'boleto',
    issuedAt: new Date().toISOString(),
    dueDate,
    beneficiaryName: 'AmazonQA Billing Company LTD',
    beneficiaryDocument: formatCnpj(fakeCnpjDigits),
    beneficiaryBank: 'Bank of Brazil S.A.',
    nossoNumero: `${String(orderId).padStart(8, '0')}${String(now).slice(-5)}`,
    barcode,
    line: `00191.79001 01043.510047 91020.150008 8 ${dueFactor}${amountInCents.slice(-10)}`,
    instructions: [
      'Do not accept payment after due date (mock).',
      '2% late fee after due date (mock).',
      '0.033% daily interest after due date (mock).',
    ],
    downloadUrl: `/api/orders/${orderId}/boleto/${now}`,
    note: 'Boleto generated with simulated data for test environment.',
  };
}

function buildPixQrImageDataUrl({ txId, amount }: { txId: string; amount: number }): string {
  const payload = `${txId}|${Number(amount || 0).toFixed(2)}|PIX-MOCK`;
  const size = 29;
  const moduleSize = 8;
  const quietZone = 4;
  const canvas = (size + quietZone * 2) * moduleSize;

  const isFinderArea = (x: number, y: number, offsetX: number, offsetY: number): boolean =>
    x >= offsetX && x < offsetX + 7 && y >= offsetY && y < offsetY + 7;

  const isFinder = (x: number, y: number): boolean =>
    isFinderArea(x, y, 0, 0) || isFinderArea(x, y, size - 7, 0) || isFinderArea(x, y, 0, size - 7);

  const finderBit = (x: number, y: number): boolean => {
    const local = (offsetX: number, offsetY: number): boolean => {
      const fx = x - offsetX;
      const fy = y - offsetY;
      const outer = fx === 0 || fx === 6 || fy === 0 || fy === 6;
      const inner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
      return outer || inner;
    };

    if (isFinderArea(x, y, 0, 0)) return local(0, 0);
    if (isFinderArea(x, y, size - 7, 0)) return local(size - 7, 0);
    if (isFinderArea(x, y, 0, size - 7)) return local(0, size - 7);
    return false;
  };

  const seedChar = (index: number): number => payload.charCodeAt(index % payload.length);
  const moduleRects: string[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let bit: boolean;

      if (isFinder(x, y)) {
        bit = finderBit(x, y);
      } else {
        const seed = seedChar(x * 3 + y * 5) + x * 17 + y * 31;
        bit = seed % 7 === 0 || seed % 11 === 0 || (x + y) % 9 === 0;
      }

      if (bit) {
        const drawX = (x + quietZone) * moduleSize;
        const drawY = (y + quietZone) * moduleSize;
        moduleRects.push(
          `<rect x="${drawX}" y="${drawY}" width="${moduleSize}" height="${moduleSize}" fill="#111111"/>`
        );
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">
  <rect width="${canvas}" height="${canvas}" fill="#ffffff"/>
  ${moduleRects.join('')}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generatePixMetadata(amount: number): Record<string, unknown> {
  const txId = `PIX${Date.now()}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const pixCode = `00020126PIX${Date.now()}5802BR5920TESTER COM6009SAO PAULO62070503***6304ABCD`;
  const readableText = `Valor ao ler QR Code: R$ ${Number(amount || 0).toFixed(2)}`;

  return {
    expiresAt,
    pixCode,
    qrCode: `PIX-QR-${Date.now()}`,
    qrCodeImage: buildPixQrImageDataUrl({ txId, amount }),
    readableText,
  };
}

function buildMethodMetadata(
  method: PaymentMethod,
  body: PaymentBody & { orderId: number; amount: number }
): Record<string, unknown> {
  if (method === 'pix') {
    return generatePixMetadata(body.amount);
  }

  if (method === 'boleto') {
    return generateBoletoMetadata(body.orderId, body.amount);
  }

  return {
    installments: Number(body.installments || 1),
    cardLast4: String(body.cardNumber || '').replace(/\D/g, '').slice(-4),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const orderId = toOrderId(routeParams);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && order.user_id !== authUserId) {
      return NextResponse.json({ error: 'Access denied for this order' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as PaymentBody;
    const method = String(body.method || '').trim().toLowerCase();
    if (!ALLOWED_METHODS.includes(method as PaymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    const paidResult = await query<{ paid: number }>(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS paid
       FROM payments
       WHERE order_id = $1 AND status = 'authorized'`,
      [orderId]
    );

    const alreadyPaid = Number(paidResult.rows[0]?.paid || 0);
    const orderTotal = Number(order.grand_total || 0);
    const remaining = Math.max(0, Number((orderTotal - alreadyPaid).toFixed(2)));

    const amount = toPositiveNumber(body.amount ?? remaining);
    if (!amount) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    if (amount > remaining) {
      return NextResponse.json({ error: 'Amount exceeds order balance' }, { status: 400 });
    }

    let status = 'authorized';
    if (method === 'pix' || method === 'boleto') status = 'pending';

    const digits = String(body.cardNumber || '').replace(/\D/g, '');
    if ((method === 'credit' || method === 'debit') && digits.endsWith('0000')) {
      status = 'failed';
    }

    const cardBrand = method === 'credit' || method === 'debit'
      ? body.cardBrand || detectCardBrand(body.cardNumber)
      : null;

    const typedMethod = method as PaymentMethod;
    const metadata = buildMethodMetadata(typedMethod, { ...body, orderId, amount });

    const inserted = await query(
      `INSERT INTO payments (
          order_id, user_id, method, amount, status,
          card_brand, provider_reference, metadata, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, order_id, user_id, method, amount, status, card_brand,
                 provider_reference, metadata, created_at, updated_at`,
      [
        orderId,
        authUserId,
        method,
        amount,
        status,
        cardBrand,
        `sim-${method}-${Date.now()}`,
        metadata,
      ]
    );

    const payment = inserted.rows[0];

    if (status === 'authorized') {
      const newPaid = Number((alreadyPaid + amount).toFixed(2));
      if (newPaid >= orderTotal) {
        await query(
          `UPDATE orders
           SET status = 'paid', payment_method = $2, updated_at = NOW()
           WHERE id = $1`,
          [orderId, method]
        );
      }
    } else if (status === 'pending') {
      await query(
        `UPDATE orders
         SET status = 'pending_payment', payment_method = $2, updated_at = NOW()
         WHERE id = $1`,
        [orderId, method]
      );
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/orders/:id/payments]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
