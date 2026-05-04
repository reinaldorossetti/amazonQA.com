package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.UserRepository
import com.amazonqa.shared.domain.models.UserAddress
import com.amazonqa.shared.domain.models.UserProfile
import com.amazonqa.shared.utils.AppErrors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FakeUserRepository : UserRepository(ApiClient(hostAddress = "localhost", hostPort = 3001)) {
    var profileResult: Result<UserProfile>? = null
    var addressResult: Result<UserAddress>? = null

    override suspend fun getProfile(): UserProfile {
        return profileResult?.getOrThrow() ?: throw Exception("Profile result not set")
    }

    override suspend fun getAddress(): UserAddress {
        return addressResult?.getOrThrow() ?: throw Exception("Address result not set")
    }

    override suspend fun updateProfile(id: Int, body: Map<String, Any?>): UserProfile {
        return profileResult?.getOrThrow() ?: throw Exception("Profile result not set")
    }

    override suspend fun updateAddress(body: Map<String, String?>): UserProfile {
        return profileResult?.getOrThrow() ?: throw Exception("Profile result not set")
    }
}

@OptIn(ExperimentalCoroutinesApi::class)
class AccountViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private lateinit val fakeRepository: FakeUserRepository
    private lateinit val viewModel: AccountViewModel

    private val testProfile = UserProfile(
        id = 1,
        first_name = "Test",
        last_name = "User",
        email = "test@example.com",
        created_at = "2024-01-01T00:00:00Z"
    )

    private val testAddress = UserAddress(
        address_street = "123 Test St",
        address_city = "Test City",
        address_state = "TS",
        address_zip = "12345"
    )

    @BeforeTest
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeRepository = FakeUserRepository()
        viewModel = AccountViewModel(fakeRepository)
    }

    @AfterTest
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `loadProfile should update state to Success when successful`() = runTest(testDispatcher) {
        fakeRepository.profileResult = Result.success(testProfile)

        viewModel.loadProfile()
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.Success, "State should be Success but was \$state")
        assertEquals(testProfile, (state as AccountState.Success).profile)
    }

    @Test
    fun `loadProfile should update state to Error when repository throws`() = runTest(testDispatcher) {
        fakeRepository.profileResult = Result.failure(Exception("Network error"))

        viewModel.loadProfile()
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.Error, "State should be Error but was \$state")
        assertEquals(AppErrors.orderLoadError, (state as AccountState.Error).message)
    }

    @Test
    fun `loadAddress should update state to AddressSuccess when successful`() = runTest(testDispatcher) {
        fakeRepository.addressResult = Result.success(testAddress)

        viewModel.loadAddress()
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.AddressSuccess, "State should be AddressSuccess but was \$state")
        assertEquals(testAddress, (state as AccountState.AddressSuccess).address)
    }

    @Test
    fun `loadAddress should update state to Error when repository throws`() = runTest(testDispatcher) {
        fakeRepository.addressResult = Result.failure(Exception("Network error"))

        viewModel.loadAddress()
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.Error, "State should be Error but was \$state")
        assertEquals(AppErrors.orderLoadError, (state as AccountState.Error).message)
    }

    @Test
    fun `updateProfile should update state to Success when successful`() = runTest(testDispatcher) {
        fakeRepository.profileResult = Result.success(testProfile)

        viewModel.updateProfile(1, mapOf("first_name" to "New Name"))
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.Success, "State should be Success but was \$state")
        assertEquals(testProfile, (state as AccountState.Success).profile)
    }

    @Test
    fun `updateAddress should update state to Success when successful`() = runTest(testDispatcher) {
        fakeRepository.profileResult = Result.success(testProfile)

        viewModel.updateAddress(mapOf("address_street" to "New St"))
        
        testDispatcher.scheduler.advanceUntilIdle()

        val state = viewModel.state.value
        assertTrue(state is AccountState.Success, "State should be Success but was \$state")
        assertEquals(testProfile, (state as AccountState.Success).profile)
    }
}