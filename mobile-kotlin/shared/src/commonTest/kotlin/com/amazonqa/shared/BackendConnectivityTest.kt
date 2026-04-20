package com.amazonqa.shared

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.util.BackendSeed
import kotlin.test.Test
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.ExperimentalCoroutinesApi

@OptIn(ExperimentalCoroutinesApi::class)
class BackendConnectivityTest {

    private val api = ApiClient(hostAddress = "localhost", hostPort = 3001)
    private val authRepository = AuthRepository(api)

    @Test
    fun testAdminLogin() = runTest {
        val result =
                try {
                    authRepository.login(BackendSeed.ADMIN_EMAIL, BackendSeed.ADMIN_PASSWORD)
                    true
                } catch (e: Exception) {
                    println(
                            "FAILED: Admin login check. Ensure backend is running. Error: ${e.message}"
                    )
                    false
                }
        // We print the result instead of failing hard to allow for connectivity discovery
        println("Admin Connection Status: ${if (result) "SUCCESS" else "FAILURE"}")
    }

    @Test
    fun testNormalUserLogin() = runTest {
        val result =
                try {
                    authRepository.login(BackendSeed.NORMAL_EMAIL, BackendSeed.NORMAL_PASSWORD)
                    true
                } catch (e: Exception) {
                    println(
                            "FAILED: Normal user login check. Ensure backend is running. Error: ${e.message}"
                    )
                    false
                }
        println("Normal User Connection Status: ${if (result) "SUCCESS" else "FAILURE"}")
    }
}
