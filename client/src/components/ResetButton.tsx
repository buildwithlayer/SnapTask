import Button from "./Button";

const ResetButton = () => {
  const handleReset = () => {
    [
      "transcript",
      "summary",
      "messages",
      "incompleteToolCalls",
      "issueToolCalls",
      "approvedIssues",
      "rejectedIssues",
      "commentToolCalls",
      "approvedComments",
      "rejectedComments",
    ].forEach((k) => localStorage.removeItem(k));

    window.location.reload();
  };

  return (
    <Button
      onClick={handleReset}
      style="outlined"
      additionalClasses="px-2 py-1"
    >
      Restart
    </Button>
  );
};

export default ResetButton;
