import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  obfuscatedCode: string;

  file: File;
  report: string;
  constructor() {}

  async deobfuscate(): Promise<void> {
    const file = this.file;
    let report = this.obfuscatedCode;

    const mapJsonArray = JSON.parse(await file.text());
    const map = {};
    const characters = new Set();
    for (let i = 0; i < mapJsonArray.length; i += 2) {
      const obfuscated = mapJsonArray[i + 1];
      const deobfuscated = mapJsonArray[i];
      if (obfuscated === deobfuscated) {
        // Obfuscation map contains pairs like "[]=":"[]=" and "toString":"toString"
        // Skip them
        continue;
      }
      for (const char of obfuscated) characters.add(char);
      map[obfuscated] = deobfuscated;
    }

    let start = 0;
    while (start < report.length) {
      if (!characters.has(report[start])) {
        start++;
        continue;
      }
      let end = start;
      while (characters.has(report[end])) end++;
      const replacement = map[report.substr(start, end - start)];
      if (replacement) {
        report = report.substr(0, start) + replacement + report.substr(end);
        start += replacement.length;
      } else start = end;
    }

    this.report = report;
  }

  onFileSelected(e: Event): void {
    this.file = (e.target as HTMLInputElement).files[0];
  }
}
