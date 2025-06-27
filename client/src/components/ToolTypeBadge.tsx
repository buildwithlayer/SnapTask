interface ToolTypeBadgeProps {
  type: "Create" | "Update";
}

const ToolTypeBadge = ({ type }: ToolTypeBadgeProps) => {
  return (
    <div
      className={`px-2 py-0.5 rounded-md border w-fit h-fit ${
        type === "Create" && "border-green-600 text-green-600"
      } ${type === "Update" && "border-yellow-600 text-yellow-600"}`}
    >
      {type}
    </div>
  );
};

export default ToolTypeBadge;
