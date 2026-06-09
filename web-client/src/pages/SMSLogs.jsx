import React from 'react'
import { useEffect, useState } from 'react'
import { databases } from '../appwrite/config'

const SMSLogs = () => {
  const [sms_logs, setSMSLogs] = useState([])

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    console.log("Database ID from env:", import.meta.env.VITE_APPWRITE_DATABASE_ID);
  console.log("Collection ID from env:", import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID);

    try {
      // FIX: Put the environment variables INSIDE the listDocuments parentheses!
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID
      )

      setSMSLogs(response.documents)
    } catch (error) {
      console.error("Appwrite connection error:", error)
    }
  }

  return (
    <div>
      {sms_logs.length === 0 ? (
        <p>No SMS logs found or waiting for connection...</p>
      ) : (
        sms_logs.map((sms_log) => (
          <div key={sms_log.$id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
            <p><strong>Message:</strong> {sms_log.message_body}</p>
            <p><strong>Phone:</strong> {sms_log.phone_number}</p>
            <p><strong>Contact:</strong> {sms_log.contact_name}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default SMSLogs
