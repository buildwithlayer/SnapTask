import Button from "./Button";

const ResetButton = () => {
  const handleReset = () => {
    [
      "transcript",
      "summary",
      "messages",
      "incompleteToolCalls",
      "create-issue-tool-calls",
      "approvedIssues",
      "rejectedIssues",
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
