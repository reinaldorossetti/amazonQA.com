package com.tester.api.tests.users;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.UsersClient;
import com.tester.api.fixture.BrazilianDocuments;
import com.tester.api.fixture.UserFixture;
import com.tester.api.model.request.AddressUpdateRequest;
import com.tester.api.model.request.AdminCreateUserRequest;
import com.tester.api.model.request.LoginRequest;
import com.tester.api.model.request.RegisterUserRequest;
import com.tester.api.model.request.UpdateUserRequest;
import com.tester.api.support.AuthSession;
import com.tester.api.support.TestFlows;
import io.restassured.response.Response;
import java.util.function.Supplier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UsersApiTest extends BaseApiTest {

  @Test
  @DisplayName("deve registrar e autenticar usuário válido")
  void deveRegistrarEAutenticarUsuarioValido() {
    RegisterUserRequest user = UserFixture.uniquePfUser();
    UsersClient.register(user).then().statusCode(201);
    UsersClient.login(new LoginRequest(user.email(), user.password()))
        .then()
        .statusCode(200)
        .body("accessToken", not(emptyOrNullString()))
        .body("tokenType", equalTo("Bearer"))
        .body("user.email", equalTo(user.email()))
        .body("user.password", nullValue());
  }

  @Test
  @DisplayName("deve retornar 409 para e-mail duplicado")
  void deveRetornar409ParaEmailDuplicado() {
    RegisterUserRequest user = UserFixture.uniquePfUser();
    Response first = UsersClient.register(user);
    if (first.statusCode() != 201) {
      user = UserFixture.uniquePfUser();
      first = UsersClient.register(user);
    }
    first.then().statusCode(201);
    UsersClient.register(user).then().statusCode(409);
  }

  @Test
  @DisplayName("deve retornar 401 para credenciais inválidas")
  void deveRetornar401ParaCredenciaisInvalidas() {
    UsersClient.login(new LoginRequest("naoexiste@example.com", "senhaErrada"))
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 401 para senha incorreta de usuário existente")
  void deveRetornar401ParaSenhaIncorretaDeUsuarioExistente() {
    RegisterUserRequest user = UserFixture.uniquePfUser();
    UsersClient.register(user).then().statusCode(201);
    UsersClient.login(new LoginRequest(user.email(), "SenhaErrada@999"))
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 400 para login sem email/senha")
  void deveRetornar400ParaLoginSemEmailSenha() {
    UsersClient.login(new LoginRequest("", "")).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 para payload incompleto")
  void deveRetornar400ParaPayloadIncompleto() {
    UsersClient.register(RegisterUserRequest.firstNameOnly("SemEmail")).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 409 para CPF duplicado")
  void deveRetornar409ParaCpfDuplicado() {
    String suffix = System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
    String cpf = BrazilianDocuments.validCpf();
    registerUntilCreated(() -> RegisterUserRequest.pfFirst(suffix, cpf))
        .then()
        .statusCode(201);
    UsersClient.register(RegisterUserRequest.pfSecond(suffix, cpf)).then().statusCode(409);
  }

  @Test
  @DisplayName("deve retornar 409 para CNPJ duplicado")
  void deveRetornar409ParaCnpjDuplicado() {
    String suffix = System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
    String cnpj = BrazilianDocuments.validCnpj();
    registerUntilCreated(
            () -> RegisterUserRequest.pjFirst(suffix, cnpj, "Empresa " + suffix))
        .then()
        .statusCode(201);
    UsersClient.register(
            RegisterUserRequest.pjSecond(suffix, cnpj, "Empresa 2 " + suffix))
        .then()
        .statusCode(409);
  }

  @Test
  @DisplayName("deve retornar 401 ao listar usuários sem autenticação")
  void deveRetornar401AoListarUsuariosSemAutenticacao() {
    given()
        .when()
        .get("/users")
        .then()
        .statusCode(401)
        .body("error", instanceOf(String.class));
  }

  @Test
  @DisplayName("deve retornar 403 ao listar usuários com token de usuário comum")
  void deveRetornar403AoListarUsuariosComTokenDeUsuarioComum() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.listUsers(auth.token(), null)
        .then()
        .statusCode(403)
        .body("error", equalTo("Access restricted to administrators"));
  }

  @Test
  @DisplayName("deve listar usuários com admin e validar formato da resposta")
  void deveListarUsuariosComAdminEValidarFormatoDaResposta() {
    String adminToken = AuthSession.adminToken();
    UsersClient.listUsers(adminToken, "page=1&pageSize=5&status=all")
        .then()
        .statusCode(200)
        .body("page", equalTo(1))
        .body("pageSize", equalTo(5))
        .body("total", instanceOf(Integer.class))
        .body("items", instanceOf(java.util.List.class));
  }

  @Test
  @DisplayName("deve retornar 403 ao criar usuário via /users com usuário não-admin")
  void deveRetornar403AoCriarUsuarioViaUsersComUsuarioNaoAdmin() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    AdminCreateUserRequest payload =
        new AdminCreateUserRequest(
            "Nao",
            "Admin",
            "not.admin." + System.currentTimeMillis() + "@example.com",
            "Senha@1234",
            null);
    UsersClient.createUser(auth.token(), payload)
        .then()
        .statusCode(403)
        .body("error", equalTo("Access restricted to administrators"));
  }

  @Test
  @DisplayName("deve criar usuário via /users quando autenticado como admin")
  void deveCriarUsuarioViaUsersQuandoAutenticadoComoAdmin() {
    String adminToken = AuthSession.adminToken();
    String email = "admin.created." + System.currentTimeMillis() + "@example.com";
    AdminCreateUserRequest payload =
        new AdminCreateUserRequest("Admin", "Created", email, "Senha@1234", "user");
    UsersClient.createUser(adminToken, payload)
        .then()
        .statusCode(201)
        .body("email", equalTo(email))
        .body("roles", hasItem("user"));
  }

  @Test
  @DisplayName("deve retornar dados do próprio usuário em /users/{id}")
  void deveRetornarDadosDoProprioUsuarioEmUsersId() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.getUser(auth.token(), auth.userId())
        .then()
        .statusCode(200)
        .body("id", equalTo(auth.userId()))
        .body("email", equalTo(auth.email()));
  }

  @Test
  @DisplayName("deve bloquear acesso de usuário comum ao /users/{id} de outro usuário")
  void deveBloquearAcessoDeUsuarioComumAoUsersIdDeOutroUsuario() {
    AuthSession.RegisteredUser userA = TestFlows.registerUser();
    AuthSession.RegisteredUser userB = TestFlows.registerUser();
    UsersClient.getUser(userA.token(), userB.userId())
        .then()
        .statusCode(403)
        .body("error", equalTo("Access denied for this user"));
  }

  @Test
  @DisplayName("deve atualizar o próprio usuário em /users/{id}")
  void deveAtualizarOProprioUsuarioEmUsersId() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    String newFirstName = "Updated-" + System.currentTimeMillis();
    UsersClient.updateUser(auth.token(), auth.userId(), UpdateUserRequest.firstName(newFirstName))
        .then()
        .statusCode(200)
        .body("id", equalTo(auth.userId()))
        .body("first_name", equalTo(newFirstName));
  }

  @Test
  @DisplayName("deve retornar 400 ao atualizar usuário sem campos permitidos")
  void deveRetornar400AoAtualizarUsuarioSemCamposPermitidos() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.updateUser(auth.token(), auth.userId(), UpdateUserRequest.empty())
        .then()
        .statusCode(400)
        .body("error", equalTo("No fields to update"));
  }

  @Test
  @DisplayName("deve retornar o usuário autenticado em /users/me")
  void deveRetornarOUsuarioAutenticadoEmUsersMe() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.me(auth.token())
        .then()
        .statusCode(200)
        .body("id", equalTo(auth.userId()))
        .body("email", equalTo(auth.email()));
  }

  @Test
  @DisplayName("deve atualizar endereço em /users/me/address")
  void deveAtualizarEnderecoEmUsersMeAddress() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.updateAddress(auth.token(), AddressUpdateRequest.saoPaulo())
        .then()
        .statusCode(200)
        .body("id", equalTo(auth.userId()))
        .body("address_city", equalTo("São Paulo"));
  }

  @Test
  @DisplayName("deve retornar 400 ao atualizar endereço sem campos em /users/me/address")
  void deveRetornar400AoAtualizarEnderecoSemCamposEmUsersMeAddress() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.updateAddress(auth.token(), AddressUpdateRequest.empty())
        .then()
        .statusCode(400)
        .body("error", equalTo("No address fields to update"));
  }

  @Test
  @DisplayName("deve retornar 200 ao consultar GET /users/me/address com usuário autenticado")
  void deveRetornar200AoConsultarGetUsersMeAddressComUsuarioAutenticado() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.updateAddress(auth.token(), AddressUpdateRequest.rio())
        .then()
        .statusCode(200);
    UsersClient.getAddress(auth.token())
        .then()
        .statusCode(200)
        .body("address_city", equalTo("Rio de Janeiro"))
        .body("address_zip", equalTo("20000-000"))
        .body("$", hasKey("address_street"))
        .body("$", hasKey("address_number"))
        .body("$", hasKey("address_complement"))
        .body("$", hasKey("address_neighborhood"))
        .body("$", hasKey("address_state"));
  }

  @Test
  @DisplayName("deve retornar 401 ao consultar GET /users/me/address sem autenticação")
  void deveRetornar401AoConsultarGetUsersMeAddressSemAutenticacao() {
    given().when().get("/users/me/address").then().statusCode(401);
  }

  @Test
  @DisplayName(
      "deve retornar 404 ao consultar GET /users/me/address com token de usuário inexistente")
  void deveRetornar404AoConsultarGetUsersMeAddressComTokenDeUsuarioInexistente() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    String adminToken = AuthSession.adminToken();
    UsersClient.deleteUser(adminToken, auth.userId()).then().statusCode(200);
    UsersClient.getAddress(auth.token()).then().statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 403 ao deletar usuário sem ser admin")
  void deveRetornar403AoDeletarUsuarioSemSerAdmin() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.deleteUser(auth.token(), auth.userId())
        .then()
        .statusCode(403)
        .body("error", equalTo("Only admin can delete users"));
  }

  @Test
  @DisplayName("deve encerrar a própria conta e retornar 409 na segunda tentativa")
  void deveEncerrarAPropriaContaERetornar409NaSegundaTentativa() {
    AuthSession.RegisteredUser auth = TestFlows.registerUser();
    UsersClient.terminate(auth.token(), auth.userId())
        .then()
        .statusCode(200)
        .body("message", equalTo("Account closed with data obfuscation applied"))
        .body("user.is_active", equalTo(false))
        .body("user.account_closed_at", not(emptyOrNullString()));
    UsersClient.terminate(auth.token(), auth.userId())
        .then()
        .statusCode(409)
        .body("error", equalTo("Account is already closed"));
  }

  @Test
  @DisplayName("deve retornar 400 para e-mail com formato inválido no registro")
  void deveRetornar400ParaEmailComFormatoInvalidoNoRegistro() {
    RegisterUserRequest user = UserFixture.uniquePfUser().withEmail("email-invalido");
    UsersClient.register(user).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 para senha muito curta no registro")
  void deveRetornar400ParaSenhaMuitoCurtaNoRegistro() {
    RegisterUserRequest user = UserFixture.uniquePfUser().withPassword("123");
    UsersClient.register(user).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao registrar sem person_type")
  void deveRetornar400AoRegistrarSemPersonType() {
    RegisterUserRequest user = UserFixture.uniquePfUser().withoutPersonType();
    UsersClient.register(user).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao registrar PF sem informar CPF")
  void deveRetornar400AoRegistrarPfSemInformarCpf() {
    RegisterUserRequest user = UserFixture.uniquePfUser().withPersonType("PF").withCpf(null);
    UsersClient.register(user).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao registrar PJ sem informar CNPJ")
  void deveRetornar400AoRegistrarPjSemInformarCnpj() {
    RegisterUserRequest user = UserFixture.uniquePfUser().withPersonType("PJ").withoutCpf();
    UsersClient.register(user).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 401 ao tentar logar com email inexistente")
  void deveRetornar401AoTentarLogarComEmailInexistente() {
    UsersClient.login(new LoginRequest("inexistente.user.999@example.com", "Senha@123"))
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 403 ao tentar atualizar perfil de outro usuário")
  void deveRetornar403AoTentarAtualizarPerfilDeOutroUsuario() {
    AuthSession.RegisteredUser userA = TestFlows.registerUser();
    AuthSession.RegisteredUser userB = TestFlows.registerUser();
    UsersClient.updateUser(
            userA.token(), userB.userId(), UpdateUserRequest.firstName("Hack Attempt"))
        .then()
        .statusCode(403);
  }

  private static Response registerUntilCreated(Supplier<RegisterUserRequest> factory) {
    Response response = null;
    for (int attempt = 0; attempt < 5; attempt++) {
      response = UsersClient.register(factory.get());
      if (response.statusCode() == 201) {
        return response;
      }
    }
    if (response == null) {
      throw new IllegalStateException(
          "Não foi possível criar um usuário válido após múltiplas tentativas.");
    }
    return response;
  }
}
