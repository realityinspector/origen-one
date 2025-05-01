#!/usr/bin/env python3

import os
import curses
import fnmatch
from typing import List, Set, Dict
from dataclasses import dataclass
from pathlib import Path


@dataclass
class FileEntry:
    path: str
    is_dir: bool
    selected: bool = False
    expanded: bool = False


class FileExporter:
    SUPPORTED_EXTENSIONS = {
        '.py': 'Python',
        '.dockerfile': 'Dockerfile',
        '.yml': 'YAML',
        '.yaml': 'YAML',
        '.ini': 'INI',
        '.json': 'JSON',
        '.md': 'Markdown',
        '.txt': 'Text',
        '.css': 'CSS',
        '.js': 'JS',
        '.html': 'HTML',
        '.sh': 'SHELL',
        '.ts': 'TS',
        '.tsx': 'TSX',
        '.jsx': 'JSX',
    }

    IGNORE_DIRS = {
        '.git', '__pycache__', '.pytest_cache', 'venv', 'env', 'node_modules',
        '.vscode', '.upm', '.pythonlibs', 'pycache', '.cache'
    }

    def __init__(self):
        self.files: List[FileEntry] = []
        self.current_pos = 0
        self.top_line = 0
        self.filter_pattern = "*"

    def load_files(self, root_dir: str = ".") -> None:
        """Load all files from the directory tree."""
        self.files.clear()
        for root, dirs, files in os.walk(root_dir):
            # Remove ignored directories
            dirs[:] = [d for d in dirs if d not in self.IGNORE_DIRS]

            rel_root = os.path.relpath(root, root_dir)
            if rel_root != ".":
                self.files.append(FileEntry(rel_root, True))

            for file in sorted(files):
                rel_path = os.path.join(rel_root, file)
                if rel_path != "export.py":  # Don't include this script
                    ext = os.path.splitext(file)[1].lower()
                    if ext in self.SUPPORTED_EXTENSIONS or file.lower(
                    ) == "dockerfile":
                        self.files.append(FileEntry(rel_path, False))

    def export_files(self, output_file: str = "exported_code.md") -> None:
        """Export selected files to a markdown document."""
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("# Code Export\n\n")

            for entry in self.files:
                if not entry.selected or entry.is_dir:
                    continue

                try:
                    ext = os.path.splitext(entry.path)[1].lower()
                    lang = self.SUPPORTED_EXTENSIONS.get(ext, "")
                    if entry.path.lower().endswith("dockerfile"):
                        lang = "dockerfile"

                    f.write(f"## {entry.path}\n\n")
                    f.write("```" + lang + "\n")

                    with open(entry.path, "r", encoding="utf-8") as src:
                        content = src.read()
                        f.write(content)
                        if not content.endswith("\n"):
                            f.write("\n")

                    f.write("```\n\n")
                except Exception as e:
                    f.write(f"Error reading {entry.path}: {str(e)}\n\n")

    def select_all(self, select: bool = True) -> None:
        """Select or deselect all files that match the current filter."""
        for entry in self.files:
            if not entry.is_dir and fnmatch.fnmatch(entry.path,
                                                    self.filter_pattern):
                entry.selected = select

    def run(self, stdscr) -> None:
        """Run the interactive file selector."""
        curses.start_color()
        curses.init_pair(1, curses.COLOR_GREEN, curses.COLOR_BLACK)
        curses.init_pair(2, curses.COLOR_CYAN, curses.COLOR_BLACK)

        while True:
            stdscr.clear()
            height, width = stdscr.getmaxyx()

            # Print header
            header = " File Export Utility | Space: Select | a: Select All | A: Deselect All | Enter: Export | q: Quit | f: Filter "
            stdscr.addstr(0, 0, header[:width - 1], curses.A_REVERSE)

            # Print filter pattern
            stdscr.addstr(1, 0, f" Filter: {self.filter_pattern} ",
                          curses.A_BOLD)

            # Print files
            for idx, entry in enumerate(
                    self.files[self.top_line:self.top_line + height - 3]):
                if not fnmatch.fnmatch(entry.path, self.filter_pattern):
                    continue

                y = idx + 2
                if y >= height:
                    break

                prefix = "📁 " if entry.is_dir else "📄 "
                display = f"{prefix}{entry.path}"

                if idx + self.top_line == self.current_pos:
                    attr = curses.A_REVERSE
                else:
                    attr = curses.A_NORMAL

                if entry.selected:
                    attr |= curses.color_pair(1)
                elif entry.is_dir:
                    attr |= curses.color_pair(2)

                stdscr.addstr(y, 0, display[:width - 1], attr)

            stdscr.refresh()

            # Handle input
            key = stdscr.getch()
            if key == ord('q'):
                break
            elif key == ord('f'):
                curses.echo()
                stdscr.addstr(1, 8, " " * 50)
                stdscr.addstr(1, 8, "")
                self.filter_pattern = stdscr.getstr(1, 8).decode('utf-8')
                curses.noecho()
            elif key == ord('a'):
                self.select_all(True)
            elif key == ord('A'):
                self.select_all(False)
            elif key == ord(' '):
                self.files[self.current_pos].selected = not self.files[
                    self.current_pos].selected
            elif key == curses.KEY_UP and self.current_pos > 0:
                self.current_pos -= 1
                if self.current_pos < self.top_line:
                    self.top_line = self.current_pos
            elif key == curses.KEY_DOWN and self.current_pos < len(
                    self.files) - 1:
                self.current_pos += 1
                if self.current_pos >= self.top_line + height - 3:
                    self.top_line = self.current_pos - height + 4
            elif key == 10:  # Enter key
                return


def main():
    exporter = FileExporter()
    exporter.load_files()

    curses.wrapper(exporter.run)

    # After selection, export the files
    selected_count = sum(1 for f in exporter.files
                         if f.selected and not f.is_dir)
    if selected_count > 0:
        output_file = "exported_code.md"
        exporter.export_files(output_file)
        print(f"\nExported {selected_count} files to {output_file}")
    else:
        print("\nNo files were selected for export")


if __name__ == "__main__":
    main()
