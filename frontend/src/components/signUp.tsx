import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@heroui/react";
import { useState } from "react";

const SignUp = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d{10}$/;

  const passwordErrors: any = [];

  if (password.length < 8) {
    passwordErrors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    passwordErrors.push("Password must include at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    passwordErrors.push("Password must include at least one lowercase letter.");
  }
  if (!/\d/.test(password)) {
    passwordErrors.push("Password must include at least one number.");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    passwordErrors.push(
      "Password must include at least one special character."
    );
  }

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Sign Up
      </Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Sign Up</ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  variant="bordered"
                />
                <Input
                  errorMessage={
                    !phoneRegex.test(phone) && phone.length > 0
                      ? "Phone number must be exactly 10 digits."
                      : ""
                  }
                  isInvalid={!phoneRegex.test(phone) && phone.length > 0}
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={phone}
                  variant="bordered"
                  onValueChange={setPhone}
                />
                <Input
                  errorMessage={
                    !emailRegex.test(email) && email.length > 0
                      ? "Enter a valid email address."
                      : ""
                  }
                  isInvalid={!emailRegex.test(email) && email.length > 0}
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  variant="bordered"
                  onValueChange={setEmail}
                />
                <Input
                  errorMessage={
                    passwordErrors.length > 0 ? (
                      <ul>
                        {passwordErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    ) : (
                      ""
                    )
                  }
                  isInvalid={passwordErrors.length > 0}
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  variant="bordered"
                  onValueChange={setPassword}
                />
                <Input
                  errorMessage={
                    confirmPassword.length > 0 && confirmPassword !== password
                      ? "Passwords do not match."
                      : ""
                  }
                  isInvalid={
                    confirmPassword.length > 0 && confirmPassword !== password
                  }
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  type="password"
                  value={confirmPassword}
                  variant="bordered"
                  onValueChange={setConfirmPassword}
                />
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox classNames={{ label: "text-small" }}>
                    I agree to the Terms & Conditions
                  </Checkbox>
                </div>
                <div className="text-center mt-2">
                  <span>Already have an account? </span>
                  <Link color="primary" href="#login">
                    Login
                  </Link>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Sign Up
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export { SignUp };
