import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import { Tooltip, Button } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useSession } from "@/hooks/useSession";

interface FAQs {
  _id?: string; // Add _id for existing FAQs
  question: string;
  answer: string;
}

export default function DocsPage() {
  const user = useSession();
  const [faqs, setFAQs] = useState<FAQs[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchFAQs = async () => {
      try {
        const response = await fetch("http://localhost:5170/api/faqs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setFAQs(data);
        } else {
          console.error("Server response:", await response.text());
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    fetchFAQs();
  }, []);

  const handleAddStep = () => {
    const newFAQ: FAQs = {
      question: "",
      answer: "",
    };
    setFAQs([...faqs, newFAQ]);
  };

  const handleQuestionChange = (index: number, newQuestion: string) => {
    const updatedFAQs = faqs.map((faq, i) =>
      i === index ? { ...faq, question: newQuestion } : faq
    );
    setFAQs(updatedFAQs);
  };

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const updatedFAQs = faqs.map((faq, i) =>
      i === index ? { ...faq, answer: newAnswer } : faq
    );
    setFAQs(updatedFAQs);
  };

  const handleDeleteFAQ = (index: number) => {
    const updatedFAQs = faqs.filter((_, i) => i !== index);
    setFAQs(updatedFAQs);
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5170/api/faqs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ faqs }), // Send the entire FAQs array
      });

      if (response.ok) {
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000); // Hide after 3s
      } else {
        console.error("Server response:", await response.text());
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-4 md:py-5">
        <div className="w-full flex flex-col items-center gap-4">
          {showAlert && (
            <div
              className="fixed top-8 right-10 z-50 p-2 bg-green-100 text-green-700 border border-green-400 rounded-lg shadow-lg
               transition-all duration-300 opacity-100 scale-100"
            >
              <Alert
                color="success"
                title="Changes have been saved successfully!"
              />
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-6">
            <h1 className="font-semibold text-xl montserrat">
              Frequently Asked Questions
            </h1>
            <div className="max-w-5xl w-full text-gray-900 bg-white border border-gray-200 rounded-lg shadow px-5 py-4">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-2 w-full">
                      <span className="font-medium">Q. </span>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          handleQuestionChange(index, e.target.value)
                        }
                        className="w-full bg-transparent border-none focus:outline-none font-medium"
                        placeholder="Enter the question..."
                      />
                    </div>
                    <Tooltip
                      closeDelay={0}
                      content="Delete this FAQ"
                      delay={0}
                      motionProps={{
                        variants: {
                          exit: {
                            opacity: 0,
                            transition: {
                              duration: 0.1,
                              ease: "easeIn",
                            },
                          },
                          enter: {
                            opacity: 1,
                            transition: {
                              duration: 0.15,
                              ease: "easeOut",
                            },
                          },
                        },
                      }}
                    >
                      <Button
                        variant="flat"
                        onPress={() => handleDeleteFAQ(index)}
                        className="ml-2 bg-transparent hover:bg-gray-100 rounded"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="red"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    value={faq.answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none p-2 rounded-lg hover:bg-gray-50"
                    placeholder="Enter the answer..."
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-5">
              <Button
                color="success"
                aria-label="Add FAQ"
                variant="faded"
                className="bg-white hover:bg-gray-100 p-2 px-7 rounded-xl border-2 border-green-600 text-green-700"
                onClick={handleAddStep}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="green"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add FAQ
              </Button>

              <Button
                color="primary"
                variant="bordered"
                onPress={handleSaveChanges}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
