import dotenv from 'dotenv'
import { AuthenticatedRequest } from './middleware/authMiddleware'
import sgMail from '@sendgrid/mail'
import { Response } from 'express'
dotenv.config()

if (process.env.SENDGRID_API_KEY) {
  console.log(process.env.SENDGRID_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export const sendMail = async (req: AuthenticatedRequest, res: Response) => {
  console.log("sendMail called")
  try {
    const body = req.body

    // Validaciones básicas
    if (typeof body.to !== 'string') throw new Error('Invalid "to" field')
    if (typeof body.from !== 'string') throw new Error('Invalid "from" field')
    if (typeof body.subject !== 'string') throw new Error('Invalid "subject" field')
    if (typeof body.text !== 'string') throw new Error('Invalid "text" field')
    if (typeof body.html !== 'string') throw new Error('Invalid "html" field')

    // Validar attachments si existen
    if (body.attachments && Array.isArray(body.attachments)) {
      body.attachments.forEach((att: any, idx: number) => {
        if (typeof att.content !== 'string') throw new Error(`Attachment ${idx}: Invalid "content"`)
        if (typeof att.filename !== 'string') throw new Error(`Attachment ${idx}: Invalid "filename"`)
        if (typeof att.type !== 'string') throw new Error(`Attachment ${idx}: Invalid "type"`)
      })
    }

    const result = await sgMail.send(body)
    console.log("sendMail result:", result)
    res.json({ success: true, message: 'Email sent successfully' })
  } catch (error: any) {
    console.error('SendGrid error:', error.message)
    res.status(400).json({ success: false, error: error.message })
  }
}