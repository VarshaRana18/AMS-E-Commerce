import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/layouts/default";
// Adjust the path as needed

interface FAQs {
  _id?: string;
  question: string;
  answer: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const [faqs, setFAQs] = useState<FAQs[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData]: any = useState<FormData>({
    name: "",
    email: "", // Add this
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Get user data from AuthContext
  const { currentUser }: any = useAuth();

  useEffect(() => {
    document.title = "AMS || Contact Us";
    const fetchFAQs = async () => {
      try {
        const response = await fetch("api/faqs", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          setFAQs(data);
        } else {
        }
      } catch (error) {}
    };

    fetchFAQs();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!currentUser && !formData.email.trim())
      newErrors.email = "Email is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onClose: () => void) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/auth/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: currentUser?.email || formData.email, // Include user's email from auth context
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Your message has been sent successfully!",
        });
        setFormData({
          name: "",
          subject: "",
          message: "",
        });
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 2000);
      } else {
        const errorData = await response.json();

        setSubmitStatus({
          success: false,
          message:
            errorData.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "Network error. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 lg:py-6 px-4 mx-auto w-full">
          <h2 className="mb-4 text-4xl tracking-tight text-center text-gray-900 dark:text-white">
            FAQs
          </h2>
          <Accordion
            className="mx-auto"
            selectionMode="multiple"
            variant="light"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq._id || index}
                aria-label={`Accordion ${index + 1}`}
                title={faq.question}
              >
                <div className="pl-4">{faq.answer}</div>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Want to contact us?
            </h3>
            <Button color="primary" onPress={onOpen}>
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Contact Us
              </ModalHeader>
              <ModalBody>
                {submitStatus && (
                  <div
                    className={`p-4 mb-4 rounded-lg ${
                      submitStatus.success
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}
                {currentUser ? (
                  <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Your email:</strong> {currentUser.email}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      htmlFor="email"
                    >
                      Your email
                    </label>
                    <input
                      className={`shadow-sm bg-gray-50 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light`}
                      id="email"
                      placeholder="your@email.com"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}
                <form className="space-y-4">
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      htmlFor="name"
                    >
                      Your name
                    </label>
                    <input
                      className={`shadow-sm bg-gray-50 border ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light`}
                      id="name"
                      placeholder="Your name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      htmlFor="subject"
                    >
                      Subject
                    </label>
                    <input
                      className={`block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      } shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light`}
                      id="subject"
                      placeholder="Let us know how we can help you"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
                      htmlFor="message"
                    >
                      Your message
                    </label>
                    <textarea
                      className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      } focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500`}
                      id="message"
                      placeholder="Leave a comment..."
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={isSubmitting || (!currentUser && !formData.email)}
                  isLoading={isSubmitting}
                  onPress={() => handleSubmit(onClose)}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default ContactUs;
