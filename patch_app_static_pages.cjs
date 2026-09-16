const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      </main>`;
const replacementStr = `        {['about', 'privacy', 'terms', 'faq', 'contact'].includes(currentTab) && (
          <StaticPageScreen pageType={currentTab as any} />
        )}
      </main>
      
      {/* Footer */}
      <Footer setCurrentTab={(tab) => {
        setSelectedRecipe(null);
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />`;

if (!content.includes("<StaticPageScreen")) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', content);
}
