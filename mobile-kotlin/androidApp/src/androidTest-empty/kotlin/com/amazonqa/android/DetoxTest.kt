package com.amazonqa.android

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.rule.ActivityTestRule
import com.wix.detox.Detox
import com.wix.detox.config.DetoxConfig
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Entrada exigida pelo Detox no APK de instrumentação: abre o canal WebSocket com o runner Node.
 * Mantida apenas em `androidTest-empty/` quando `-PdetoxHarnessOnly=true`.
 */
@RunWith(AndroidJUnit4::class)
@LargeTest
class DetoxTest {

    @get:Rule
    val activityRule = ActivityTestRule(MainActivity::class.java, false, false)

    @Test
    fun runDetoxTests() {
        val detoxConfig =
            DetoxConfig().apply {
                idlePolicyConfig.masterTimeoutSec = 90
                idlePolicyConfig.idleResourceTimeoutSec = 60
                rnContextLoadTimeoutSec = if (BuildConfig.DEBUG) 180 else 60
            }
        Detox.runTests(activityRule, detoxConfig)
    }
}
