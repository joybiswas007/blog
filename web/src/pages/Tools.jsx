import { Link } from "react-router-dom";
import { FiShield, FiArrowLeft, FiChevronRight } from "react-icons/fi";

const Tools = () => {
  const tools = [
    {
      name: "Login Attempts",
      path: "/auth/tools/login-attempts",
      desc: "Monitor authentication activity",
      icon: <FiShield />,
      color: "#98c379" // green
    }
  ];

  const pageTitle = "Tools :: Joy's Blog";

  return (
    <>
      <title>{pageTitle}</title>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center rounded bg-[#353b45]">
            <FiShield className="w-5 h-5 text-[#61afef]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-sans text-[#abb2bf]">
              Toolbox
            </h1>
            <p className="text-[11px] font-mono text-[#5c6370]">auth/tools</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
          >
            <FiArrowLeft />
            <span>Back</span>
          </Link>
        </div>

        {/* Tools Grid */}
        <div className="space-y-3">
          {tools.map((tool, i) => (
            <Link
              key={i}
              to={tool.path}
              className="group flex items-center gap-4 p-4 rounded no-underline transition-all bg-[#21252b] border border-[#2c313a] border-l-2 border-l-transparent hover:bg-[#2c313a] hover:border-l-[#61afef]"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded bg-[#282c34] shrink-0 transition-all group-hover:bg-opacity-80"
                style={{ color: tool.color }}
              >
                <span className="text-2xl">{tool.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold mb-1 font-sans text-[#abb2bf] transition-colors group-hover:text-[#61afef]">
                  {tool.name}
                </h3>
                <p className="text-[13px] font-sans text-[#5c6370] line-clamp-1">
                  {tool.desc}
                </p>
              </div>

              {/* Arrow */}
              <FiChevronRight className="w-5 h-5 text-[#5c6370] shrink-0 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="pt-4 border-t border-t-[#2c313a]">
          <p className="text-[11px] font-mono text-[#5c6370] text-center">
            💡 Use these tools to manage security and user activity
          </p>
        </div>
      </div>
    </>
  );
};

export default Tools;
