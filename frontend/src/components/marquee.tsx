/* eslint-disable prettier/prettier */
import Marquee from "react-fast-marquee";
import "../styles/fontStyles.css";

const reviews = [
  { text: "Revive. Repair. Reboot." },
  { text: "Power Up with Premium PC Parts!" },
  { text: "Your Dream PC, Your Way!" },
  { text: "One Stop. All Solutions." },
  { text: "Your PC’s Best Friend in Repairs!" },
  { text: "Crafting Power, One Component at a Time!" },
  { text: "Precision-Built PCs for Ultimate Performance!" },
  { text: "Where Performance Meets Perfection!" },
  { text: "Upgrade Your PC, Elevate Your Experience!" },
  { text: "From Repairs to Custom Builds – We Do It All!" },
  { text: "Build It. Customize It. Own It!" },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ text }: { text: string }) => {
  return (
    <div className="px-8 py-3 text-2xl font-semibold text-gray-900 rounded-lg comfortaa ">
      {text}
    </div>
  );
};

export function MarqueeText() {
  return (
    <div className="relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-white my-10">
      <Marquee gradient pauseOnHover gradientWidth={50} speed={40}>
        {firstRow.map((review, index) => (
          <div key={index} className="mx-10 my-11">
            <ReviewCard {...review} />
          </div>
        ))}
      </Marquee>
      <Marquee
        gradient
        pauseOnHover
        direction="right"
        gradientWidth={50}
        speed={40}
      >
        {secondRow.map((review, index) => (
          <div key={index} className="mx-10 my-11">
            <ReviewCard {...review} />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
