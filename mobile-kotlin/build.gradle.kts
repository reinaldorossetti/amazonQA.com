plugins {
    // This is the root build file where you can add configuration options common to all
    // sub-projects/modules.
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.androidLibrary) apply false
    alias(libs.plugins.kotlinMultiplatform) apply false
    alias(libs.plugins.kotlinAndroid) apply false
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.composeMultiplatform) apply false
}

tasks.register("clean", Delete::class) { delete(rootProject.layout.buildDirectory) }

tasks.register("rebuild") {
    description = "Cleans and builds the Android debug app"
    group = "build"

    // Depend on clean tasks from all modules
    dependsOn("clean")
    dependsOn(":shared:clean")
    dependsOn(":androidApp:clean")

    // Depend on the actual build task
    dependsOn(":androidApp:assembleDebug")
}

// Ensure clean happens before assemble
tasks.named("rebuild") {
    val cleanTasks = listOf("clean", ":shared:clean", ":androidApp:clean")
    val assembleTask = ":androidApp:assembleDebug"

    cleanTasks.forEach { cleanPath ->
        tasks.findByPath(cleanPath)?.let { cleanTask ->
            tasks.findByPath(assembleTask)?.mustRunAfter(cleanTask)
        }
    }
}
