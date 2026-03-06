--enforces uniquesness on an itemId once the  status of that item is 'APPROVED'. Enforces one item, one booking.  
CREATE UNIQUE INDEX "unique_approved_booking"
ON "Booking" ("itemId")
WHERE (status = 'APPROVED');