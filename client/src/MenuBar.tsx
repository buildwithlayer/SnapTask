import logoUrl from "./assets/react.svg";

function MenuBar() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-6 bg-gray-950 text-white">
      <div className="max-w-content-max-width w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img alt={"Logo"} src={logoUrl} />
          <div className="font-bold text-xl">SnapLinear</div>
        </div>
      </div>
    </div>
  );
}

export default MenuBar;
