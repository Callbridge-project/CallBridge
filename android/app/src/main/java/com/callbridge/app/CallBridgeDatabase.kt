package com.callbridge.app

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

// @Database tells Room which entities (tables) this database contains
// version = 1 is your starting version — increment when you change the schema
@Database(
    entities = [CallLogEntity::class],
    version = 2,
    exportSchema = false
)
abstract class CallBridgeDatabase : RoomDatabase() {

    // Room generates the implementation of this automatically
    abstract fun callLogDao(): CallLogDao

    companion object {
        // Volatile ensures changes are immediately visible to all threads
        @Volatile
        private var INSTANCE: CallBridgeDatabase? = null

        // Singleton pattern — only one database instance ever exists
        fun getInstance(context: Context): CallBridgeDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CallBridgeDatabase::class.java,
                    "callbridge_database"
                )
                    .fallbackToDestructiveMigration(dropAllTables = true)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}