const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf-8');

code = code.replace("const { t } = useLanguage();", `const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);`);

code = code.replace("const loadData = async () => {", `const loadData = async (forceRefresh = false) => {`);

code = code.replace(/const taskSnap = await getCachedQuery\(q, `tasks_history_\$\{auth.currentUser!.uid\}`\);/g, `const taskSnap = forceRefresh ? await getDocs(q) : await getCachedQuery(q, \`tasks_history_\${auth.currentUser!.uid}\`);`);

code = code.replace(/const jobSnap = await getCachedQuery\(jobsQuery, "jobs_active_list"\);/g, `const jobSnap = forceRefresh ? await getDocs(jobsQuery) : await getCachedQuery(jobsQuery, "jobs_active_list");`);

code = code.replace(/try \{/g, `try {
      if (forceRefresh) setIsRefreshing(true);`);

code = code.replace(/\s*handleFirestoreError\(error, OperationType.GET, 'jobs or tasks'\);\s*\}/g, `
        handleFirestoreError(error, OperationType.GET, 'jobs or tasks');
      } finally {
        if (forceRefresh) setIsRefreshing(false);
      }`);

code = code.replace("  const startTask = (jobId: string) => {", `  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && window.scrollY <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY;
      if (diff > 0) {
        setPullMoveY(Math.min(diff, 100));
        // if (e.cancelable) e.preventDefault(); // can't preventDefault easily here due to passive listener
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullMoveY > 60 && !isRefreshing) {
      playTapSound();
      loadData(true);
    }
    setPullStartY(0);
    setPullMoveY(0);
  };

  const startTask = (jobId: string) => {`);

code = code.replace(/<div className="pt-6 px-4 pb-20">/g, `<div 
      className="pt-6 px-4 pb-20 min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="flex justify-center items-center overflow-hidden transition-all duration-300"
        style={{ height: pullMoveY > 0 ? \`\${pullMoveY}px\` : (isRefreshing ? '60px' : '0px') }}
      >
        <div className={\`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md \${isRefreshing ? 'animate-spin' : ''}\`}
             style={{ transform: \`rotate(\${pullMoveY * 3}deg)\` }}>
          <RefreshCw className={\`w-5 h-5 text-indigo-500 \${isRefreshing ? '' : 'opacity-70'}\`} />
        </div>
      </div>`);

fs.writeFileSync('src/pages/Tasks.tsx', code);
