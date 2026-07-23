export const appointmentApprovedTemplate = (
  name,
  email,
  counsellorName,
  date,
  time
) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Appointment Confirmed</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2; font-family: Arial, Helvetica, sans-serif; color:#333333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2; padding:40px 0;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:40px 48px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="font-size:22px; font-weight:700; color:#222222;">
                Safe Harbor
              </div>
              <div style="font-size:13px; color:#777777; margin-top:4px;">
                Your Safe Space for Mental Well-Being
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:30px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding-top:10px;">

              <h1 style="font-size:20px; font-weight:700; margin-bottom:18px; color:#222222;">
                Appointment Confirmed
              </h1>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                Hello ${name.toLowerCase()},
              </p>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                Your session with <strong>${counsellorName.toLowerCase()}</strong> is confirmed.
              </p>

              <!-- Appointment Details Box -->
              <div style="
                background-color:#f7f7f7;
                padding:18px;
                margin:28px 0;
                font-size:15px;
                line-height:1.7;
              ">
                <strong>Date:</strong> ${date}<br/>
                <strong>Time:</strong> ${time}
              </div>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                If you need to reschedule or have any questions, please contact support.
                We look forward to supporting you.
              </p>

            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:30px;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="font-size:12px; color:#888888; padding-top:20px; line-height:1.6;">
              <p style="margin:6px 0;">This email was sent to ${email}</p>
              <p style="margin:6px 0;">Need help? Contact us at <strong>support@safeharbor.com</strong></p>
              <p style="margin:6px 0;">© 2026 Safe Harbor. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
