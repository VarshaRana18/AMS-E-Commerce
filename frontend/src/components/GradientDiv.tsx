interface GradientDivProps {
  gradient: string;
  text: string;
  color: string;
}

export default function GradientDiv({
  gradient,
  text,
  color,
}: GradientDivProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-3xl font-semibold rounded-2xl group ${gradient} group-hover:from-purple-600 group-hover:to-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 h-80 w-full bg-white montserrat`}
    >
      <span
        className={`relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-2xl flex justify-center items-center w-full h-full group-hover:bg-transparent ${color} group-hover:text-white`}
      >
        {text}
      </span>
    </div>
  );
}
