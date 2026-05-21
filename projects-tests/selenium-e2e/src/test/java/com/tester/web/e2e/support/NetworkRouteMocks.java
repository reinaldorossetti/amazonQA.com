package com.tester.web.e2e.support;

import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

public final class NetworkRouteMocks {

  private NetworkRouteMocks() {}

  public static Route orderCreateServerError() {
    return Route.matching(NetworkRouteMocks::isOrderCreatePost)
        .to(
            () ->
                req ->
                    jsonResponse(
                        500, "{\"error\":\"Falha ao criar pedido\"}"));
  }

  public static Route orderCreateEmptyCartBadRequest() {
    return Route.matching(NetworkRouteMocks::isOrderCreatePost)
        .to(
            () ->
                req ->
                    jsonResponse(
                        400, "{\"error\":\"Carrinho vazio ou payload inválido\"}"));
  }

  public static Route orderCreateSuccessWithPaymentBadRequest(int orderId) {
    return Route.combine(
        Route.matching(NetworkRouteMocks::isOrderCreatePost)
            .to(
                () ->
                    req ->
                        jsonResponse(
                            201,
                            "{\"id\":"
                                + orderId
                                + ",\"order_number\":\"ORD-ERR-001\",\"grand_total\":100}")),
        Route.matching(req -> isOrderPaymentPost(req, orderId))
            .to(
                () ->
                    req ->
                        jsonResponse(
                            400,
                            "{\"error\":\"ID inválido, método inválido, valor inválido ou maior que saldo\"}")));
  }

  public static Route orderCreateSuccessWithPaymentNotFound(int orderId) {
    return Route.combine(
        Route.matching(NetworkRouteMocks::isOrderCreatePost)
            .to(
                () ->
                    req ->
                        jsonResponse(
                            201,
                            "{\"id\":"
                                + orderId
                                + ",\"order_number\":\"ORD-404\",\"grand_total\":100}")),
        Route.matching(req -> isOrderPaymentPost(req, orderId))
            .to(
                () ->
                    req ->
                        jsonResponse(404, "{\"error\":\"Pedido não encontrado\"}")));
  }

  private static boolean isOrderCreatePost(HttpRequest request) {
    return POST.equals(request.getMethod())
        && request.getUri().contains("/api/orders")
        && !request.getUri().contains("/payments");
  }

  private static boolean isOrderPaymentPost(HttpRequest request, int orderId) {
    return POST.equals(request.getMethod())
        && request.getUri().contains("/api/orders/" + orderId + "/payments");
  }

  private static HttpResponse jsonResponse(int status, String body) {
    return new HttpResponse()
        .setStatus(status)
        .addHeader("Content-Type", "application/json")
        .setContent(utf8String(body));
  }
}
