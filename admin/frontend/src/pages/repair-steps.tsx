import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import { Tooltip, Button } from "@heroui/react";
import { Alert } from "@heroui/react";
import { useSession } from "@/hooks/useSession";

interface RepairSteps {
  step_number: number;
  description: string;
}

export default function DocsPage() {
  const user = useSession();
  const [steps, setSteps] = useState<RepairSteps[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchSteps = async () => {
      try {
        const response = await fetch(
          "http://localhost:5170/api/repairs/steps",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSteps(data);
        } else {
          console.error("Server response:", await response.text());
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    fetchSteps();
  }, []);

  const handleStepChange = (index: number, newDescription: string) => {
    const updatedSteps = steps.map((step, i) =>
      i === index ? { ...step, description: newDescription } : step
    );
    setSteps(updatedSteps);
  };

  const handleDeleteStep = (stepNumber: number) => {
    setSteps((prevSteps) =>
      prevSteps.filter((step) => step.step_number !== stepNumber)
    );
  };

  const handleAddStep = () => {
    const newStepNumber =
      steps.length > 0 ? steps[steps.length - 1].step_number + 1 : 1;
    const newStep: RepairSteps = {
      step_number: newStepNumber,
      description: "",
    };
    setSteps([...steps, newStep]);
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5170/api/repairs/steps", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ steps }),
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
              Get Your PC Fixed: Step-by-Step Guide
            </h1>
            <div className="max-w-4xl w-full text-gray-900 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              {steps.map((step, index) => (
                <div
                  key={step.step_number}
                  className="relative flex items-center w-full px-6 py-2 text-sm font-medium border-b border-gray-200 hover:bg-gray-100 hover:text-gray-700 focus:z-10 focus:ring-2 focus:ring-gray-700"
                >
                  <span className="mr-4">{index + 1}.</span>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none"
                  />
                  <Tooltip
                    closeDelay={0}
                    content="Delete this step"
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
                      onPress={() => handleDeleteStep(step.step_number)}
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
              ))}
            </div>
            <div className="flex gap-5">
              <Button
                color="success"
                aria-label="Add Step"
                variant="faded"
                className="bg-white hover:bg-gray-100 p-2 px-7 rounded-xl border-2 border-green-600 text-green-700"
                onClick={handleAddStep} // Add this onClick event
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
                Add Step
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
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
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
