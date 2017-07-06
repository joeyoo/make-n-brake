# Make N' Brake
## Tool that helps automate Media Production's DVD -> MKV -> MP4 digization process, which uses MakeMKV and Handbrake

## USER WORKFLOW:

1. Project Setup - User is prompted to enter project details:
		1- Project Name
		2- Requester's last name
		3- Department code (optional)
2. Initial Disc Check

3. MakeMKV
	- Once disc number is entered, begin making the MKV file in the project


## BACKEND WORKFLOW:

1. Project Setup 
	- CLI interface begins
2. Initial Disc Check
	- IF disc tray is empty, THEN eject tray AND prompt User to load tray
	- IF disc tray isn't empty, THEN prompt User to EITHER type in disc number OR eject incorrect disc