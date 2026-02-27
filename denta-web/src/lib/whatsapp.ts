import { Booking } from "../hooks/useBookings";

export function getWhatsAppLink(booking: Booking) {
    if (!booking.patient_phone) return null;

    const dateParts = booking.requested_date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    const clinicName = booking.clinic_name || "la clínica";
    const clinicAddress = booking.clinic_address || "nuestro consultorio";

    const message = `Hola ${booking.patient_name}, tu cita en *${clinicName}* ha sido confirmada para el día *${formattedDate}* a las *${booking.requested_time}*. \n\n📍 Dirección: ${clinicAddress}\n\n¡Te esperamos!`;

    // Remove non-numeric characters for the link
    const phone = booking.patient_phone.replace(/\D/g, '');

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
