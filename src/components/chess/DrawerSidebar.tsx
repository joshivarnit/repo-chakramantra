"use client";

import React from 'react';
import {
  Search,
  Swords,
  BarChart3,
  Edit3,
  FolderArchive,
  Target,
  Settings,
  Info,
  X,
} from 'lucide-react';

export type ActiveView = 
  | 'analysis'
  | 'play'
  | 'report'
  | 'editor'
  | 'archive'
  | 'openings'
  | 'settings'
  | 'about';

interface DrawerSidebarProps {
  isOpen: boolean;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onClose: () => void;
}

export default function DrawerSidebar({
  isOpen,
  activeView,
  onSelectView,
  onClose,
}: DrawerSidebarProps) {
  const menuItems: Array<{ id: ActiveView; label: string; icon: React.ReactNode }> = [
    { id: 'analysis', label: 'Analysis Board', icon: <Search size={20} /> },
    { id: 'play', label: 'Play Chess', icon: <Swords size={20} /> },
    { id: 'report', label: 'Analyze Game', icon: <BarChart3 size={20} /> },
    { id: 'editor', label: 'Board Editor', icon: <Edit3 size={20} /> },
    { id: 'archive', label: 'Games Archive', icon: <FolderArchive size={20} /> },
    { id: 'openings', label: 'Openings', icon: <Target size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    { id: 'about', label: 'About', icon: <Info size={20} /> },
  ];

  return (
    <>
      {/* Dim Backdrop overlay on mobile */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <aside className={`chess-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header with avatar & app name */}
        <div className="drawer-header">
          <div className="drawer-profile">
            <div className="drawer-avatar-ring">
              <span className="drawer-avatar-icon">♟</span>
            </div>
            <div className="drawer-title-group">
              <h2 className="drawer-title">ChakraChess Pro</h2>
              <span className="drawer-subtitle">Grandmaster Edition</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="drawer-nav">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                className={`drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
              >
                <span className="drawer-item-icon">{item.icon}</span>
                <span className="drawer-item-label">{item.label}</span>
                {isActive && <span className="drawer-item-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="drawer-footer">
          <span className="drawer-version">Stockfish 16 NNUE Active</span>
        </div>
      </aside>
    </>
  );
}
