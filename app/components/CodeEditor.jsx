'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, FileText, ChevronRight, ChevronDown, Terminal, 
  Play, X, Plus, Trash2, RefreshCw, Minimize2
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  // File system state
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'Project',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: '2',
          name: 'src',
          type: 'folder',
          expanded: true,
          children: [
            { 
              id: '3', 
              name: 'index.html', 
              type: 'file', 
              content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Web App</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Hello World</h1>\n    <p>Edit the files to see changes!</p>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>', 
              language: 'html' 
            },
            { 
              id: '4', 
              name: 'styles.css', 
              type: 'file', 
              content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f0f0f0;\n}\n\n#app {\n  max-width: 800px;\n  margin: 0 auto;\n  background: white;\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}\n\nh1 {\n  color: #333;\n  margin-bottom: 20px;\n}\n\np {\n  color: #666;\n  line-height: 1.6;\n}', 
              language: 'css' 
            },
            { 
              id: '5', 
              name: 'script.js', 
              type: 'file', 
              content: '// Main application code\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Application started!");\n  \n  // Example function\n  function updateTime() {\n    const timeElement = document.createElement("div");\n    timeElement.textContent = new Date().toLocaleTimeString();\n    document.getElementById("app").appendChild(timeElement);\n  }\n  \n  // Update time every second\n  setInterval(updateTime, 1000);\n});', 
              language: 'javascript' 
            }
          ]
        }
      ]
    }
  ]);

  // Editor state
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Terminal state
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [terminalCommands, setTerminalCommands] = useState(['$ Ready']);
  const [terminalInput, setTerminalInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const terminalRef = useRef(null);

  // Modal state
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, target: null });

  // Terminal Functions
  const addTerminalCommand = (command) => {
    setTerminalCommands(prev => [...prev, command]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleTerminalCommand = (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.trim();
      addTerminalCommand(`$ ${command}`);

      // Handle commands
      switch (command.toLowerCase()) {
        case 'clear':
          setTerminalCommands(['$ Ready']);
          break;
        case 'run':
          addTerminalCommand('Running project...');
          runProject();
          break;
        case 'ls':
          const fileList = files.map(f => f.name).join(' ');
          addTerminalCommand(fileList);
          break;
        case 'help':
          addTerminalCommand('Available commands:');
          addTerminalCommand('  run    - Run the project');
          addTerminalCommand('  clear  - Clear terminal');
          addTerminalCommand('  ls     - List files');
          addTerminalCommand('  help   - Show this help');
          break;
        default:
          addTerminalCommand(`Command not found: ${command}`);
          break;
      }
      setTerminalInput('');
    }
  };

  // Terminal resize handling
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newHeight = window.innerHeight - e.clientY;
        setTerminalHeight(Math.max(100, Math.min(400, newHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Project run function
  const runProject = () => {
    const getFileContent = (filename) => {
      const findContent = (items) => {
        for (const item of items) {
          if (item.type === 'file' && item.name === filename) {
            return item.content;
          }
          if (item.children) {
            const found = findContent(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findContent(files);
    };

    const html = getFileContent('index.html');
    const css = getFileContent('styles.css');
    const js = getFileContent('script.js');

    if (html && css && js) {
      addTerminalCommand('Project compiled successfully!');
      addTerminalCommand('Starting development server...');
      
      // Simulate server startup
      setTimeout(() => {
        addTerminalCommand('Server running at http://localhost:3000');
        addTerminalCommand('Ready for preview!');
      }, 1000);
      
      return { html, css, js };
    } else {
      addTerminalCommand('Error: Missing required files!');
      return null;
    }
  };

  // File system functions
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const findFileById = (id, items = files) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFileById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const updateFileContent = (id, newContent) => {
    const updateFilesRecursive = (items) => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, content: newContent };
        }
        if (item.children) {
          return { ...item, children: updateFilesRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles(updateFilesRecursive(files));
  };

  const toggleFolder = (id) => {
    const toggleFolderRecursive = (items) => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: toggleFolderRecursive(item.children) };
        }
        return item;
      });
    };
    setFiles(toggleFolderRecursive(files));
  };

  // File handling functions
  const openFile = (file) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFile(file);
  };

  const closeFile = (fileId, event) => {
    event?.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      target: item
    });
  };

  // File Tree Component
  const FileTreeItem = ({ item, level = 0 }) => {
    const isFolder = item.type === 'folder';
    const Icon = isFolder ? (item.expanded ? ChevronDown : ChevronRight) : FileText;
    
    return (
      <div className="file-tree-item">
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
            selectedFile?.id === item.id ? 'bg-gray-700' : ''
          }`}
          style={{ paddingLeft: `${level * 16}px` }}
          onClick={() => {
            setSelectedFile(item);
            if (!isFolder) openFile(item);
          }}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <Icon
            size={16}
            className={`mr-1 ${isFolder ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
              if (isFolder) {
                e.stopPropagation();
                toggleFolder(item.id);
              }
            }}
          />
          <span className="truncate">{item.name}</span>
        </div>
        {isFolder && item.expanded && item.children?.map(child => (
          <FileTreeItem key={child.id} item={child} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* File Explorer */}
      <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 text-sm font-medium border-b border-gray-700 flex justify-between items-center">
          <span className="text-lg">Explorer</span>
          <button
            onClick={() => setShowNewFileModal(true)}
            className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {files.map(item => (
            <FileTreeItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="h-9 bg-gray-800 border-b border-gray-700 flex items-center px-2">
          {openFiles.map(file => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`flex items-center px-3 py-1 text-sm border-r border-gray-700 cursor-pointer ${
                activeFile?.id === file.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <FileText size={14} className="mr-1" />
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={(e) => closeFile(file.id, e)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative">
          {activeFile ? (
            <Editor
              height="100%"
              defaultLanguage={activeFile.language}
              value={activeFile.content}
              onChange={(value) => updateFileContent(activeFile.id, value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 10 }
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a file to edit
            </div>
          )}
        </div>

        {/* Terminal */}
        {terminalVisible && (
          <div 
            className="border-t border-gray-700 bg-gray-900"
            style={{ height: `${terminalHeight}px` }}
          >
            <div 
              className="h-6 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700 cursor-row-resize"
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="flex items-center">
                <Terminal size={14} className="mr-2" />
                <span className="text-sm">Terminal</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTerminalVisible(false)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <Minimize2 size={14} />
                </button>
              </div>
            </div>
            <div 
              ref={terminalRef}
              className="h-[calc(100%-24px)] overflow-auto p-4 font-mono text-sm"
            >
              {terminalCommands.map((cmd, i) => (
                <div key={i} className="text-gray-300">{cmd}</div>
              ))}
              <div className="flex items-center mt-1">
                <span className="text-gray-300">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleTerminalCommand}
                  className="flex-1 ml-2 bg-transparent outline-none text-gray-300"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;