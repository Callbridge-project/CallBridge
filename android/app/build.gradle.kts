import java.util.Properties

// Load local.properties
val localProps = Properties()
val localPropsFile = rootProject.file("local.properties")
if (localPropsFile.exists()) {
    localPropsFile.inputStream().use { localProps.load(it) }
}

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.callbridge.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.callbridge.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Helper to ensure properties from local.properties are correctly quoted for BuildConfig
        fun getBuildConfigValue(key: String): String {
            val value = localProps.getProperty(key, "").replace("\"", "")
            return "\"$value\""
        }

        // Appwrite config from local.properties
        buildConfigField("String", "APPWRITE_ENDPOINT", getBuildConfigValue("APPWRITE_ENDPOINT"))
        buildConfigField("String", "APPWRITE_PROJECT_ID", getBuildConfigValue("APPWRITE_PROJECT_ID"))
        buildConfigField("String", "APPWRITE_DATABASE_ID", getBuildConfigValue("APPWRITE_DATABASE_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_USERS", getBuildConfigValue("APPWRITE_USERS_COLLECTION_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_CALLLOGS", getBuildConfigValue("APPWRITE_CALL_LOGS_COLLECTION_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_SMSLOGS", getBuildConfigValue("APPWRITE_SMS_LOGS_COLLECTION_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_DEVICES", getBuildConfigValue("APPWRITE_DEVICES_COLLECTION_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_ACTIVITYLOGS", getBuildConfigValue("APPWRITE_ACTIVITY_LOGS_COLLECTION_ID"))
        buildConfigField("String", "APPWRITE_COLLECTION_SUPPORTTICKETS", getBuildConfigValue("APPWRITE_SUPPORT_TICKETS_COLLECTION_ID"))

    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation("com.google.accompanist:accompanist-permissions:0.34.0")
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation("io.appwrite:sdk-for-android:8.1.0")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Room database
    implementation("androidx.room:room-runtime:2.7.1")
    implementation("androidx.room:room-ktx:2.7.1")
    ksp("androidx.room:room-compiler:2.7.1")

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    debugImplementation(libs.androidx.compose.ui.tooling)
}