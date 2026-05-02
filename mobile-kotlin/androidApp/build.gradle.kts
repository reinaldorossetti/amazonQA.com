import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.kotlinAndroid)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.amazonqa.android"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.amazonqa.android"
        minSdk = 34
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes { getByName("release") { isMinifyEnabled = false } }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildFeatures { compose = true; buildConfig = true }
    testOptions {
        unitTests.isIncludeAndroidResources = true
        unitTests.all { test ->
            test.systemProperty(
                "allure.results.directory",
                layout.buildDirectory.dir("allure-results").get().asFile.absolutePath
            )
        }
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(libs.androidx.activity.compose)
    implementation(libs.compose.ui)
    implementation(libs.compose.material)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons.extended)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.koin.android)
    implementation(libs.coil.compose)
    implementation(libs.zxing)

    // ── Testes unitários (Robolectric/JVM) ────────────────────────────────
    testImplementation(libs.junit)
    testImplementation(libs.robolectric)
    testImplementation(libs.androidx.test.ext.junit)
    testImplementation(libs.espresso.core)
    testImplementation(libs.compose.ui.test.junit4)
    testImplementation(libs.allure.junit4)
    debugImplementation(libs.compose.ui.test.manifest)

    // Detox E2E (androidTest APK must include native bridge — version aligned with npm `detox`)
    androidTestImplementation("com.wix:detox:20.51.0")

    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.espresso.core)
    androidTestImplementation(libs.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.test.runner)
    androidTestImplementation(libs.androidx.test.rules)
    androidTestImplementation(libs.allure.kotlin.junit4)
    androidTestImplementation(libs.allure.kotlin.android)
    
    // Random Data Generation
    testImplementation(libs.faker)
    androidTestImplementation(libs.faker)
}

// Detox harness-only toggle: when -PdetoxHarnessOnly=true, use empty androidTest sourceSet
val detoxHarnessOnly = project.findProperty("detoxHarnessOnly")?.toString() == "true"

if (detoxHarnessOnly) {
    println("Detox harness-only build enabled: using empty androidTest sources")
    // Replace (do not append) androidTest roots: `srcDirs` only *adds* paths, so the default
    // `src/androidTest/kotlin` would still compile all Espresso/Compose tests into the test APK.
    val emptyKotlin = layout.projectDirectory.dir("src/androidTest-empty/kotlin")
    val emptyRes = layout.projectDirectory.dir("src/androidTest-empty/res")
    android.sourceSets.getByName("androidTest").apply {
        java.setSrcDirs(listOf(emptyKotlin))
        res.setSrcDirs(listOf(emptyRes))
    }
    // Kotlin Android keeps `src/androidTest/kotlin` wired into compile*AndroidTestKotlin separately
    // from the AGP `java` SourceDirectorySet — exclude real tests so only `androidTest-empty` is compiled.
    tasks.withType<KotlinCompile>().configureEach {
        if (!name.contains("AndroidTest", ignoreCase = true)) return@configureEach
        exclude {
            val p = it.file.invariantSeparatorsPath
            p.contains("/src/androidTest/kotlin/") && !p.contains("/src/androidTest-empty/")
        }
    }
}
