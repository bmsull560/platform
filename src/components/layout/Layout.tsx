import LeftSidebar from './LeftSidebar';
import React, { FC } from 'react';
import Header from './Header';
import RightSidebar from './RightSidebar';
import { SidebarPreference, useAppearance } from '../../hooks/useAppearance';

interface LayoutProps {
  label?: string;
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ label, children }) => {
  const { contentWidth, leftSidebar, rightSidebar } = useAppearance();

  const generateSidebarWidth = (pref: SidebarPreference) => {
    switch (pref) {
      case 'closed':
        return 'w-16';

      case 'open':
        return 'w-64';

      case 'auto':
        return 'w-16 hover:w-64';

      default:
        return '';
    }
  };

  return (
    <div className="flex w-full h-screen min-h-screen">
      <LeftSidebar
        className={`transition-all duration-300 ${generateSidebarWidth(
          leftSidebar
        )}`}
      />
      {/* left-0 right-0 md:left-16 md:right-16 */}
      <main
        className={`bg-[#111113] left-0 right-0 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 flex flex-col p-7 gap-5 h-screen fixed top-0 min-h-full overflow-auto ${
          contentWidth === 'padded' && 'md:px-56'
        } ${leftSidebar === 'open' ? 'md:left-64' : 'md:left-16'} ${
          rightSidebar === 'open' ? 'md:right-64' : 'md:right-16'
        }`}
      >
        <Header label={label} />
        <div>{children}</div>
      </main>

      <RightSidebar
        className={`transition-all duration-300 ${generateSidebarWidth(
          rightSidebar
        )}`}
      />
    </div>
  );
};

export default Layout;
