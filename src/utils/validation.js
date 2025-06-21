const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error(" Name is not valid");
    }

    if (firstName.length < 4 || !lastName.length < 4) {
        throw new Error(" Name length should be at least 4 characters");
    }
}