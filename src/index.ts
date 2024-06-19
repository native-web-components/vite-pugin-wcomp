import fs from 'node:fs';
import path from "node:path";
import axios from 'axios';
import { Plugin } from 'vite';

interface Options {
  cacheDir: string;
  prefix?: string;
}

export default function loadAndCacheWebComponents(options: Options): Plugin {
  const { prefix = 'wc-', cacheDir = './comp_modules' } = options;
  const cacheDirPath = path.resolve(process.cwd(), cacheDir);

  const cacheComponent = async (componentName: string) => {
    console.log(`cache component: ${componentName}`);
    const componentPath = path.join(cacheDirPath, componentName);
    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
      console.log(`begin download component: ${componentName}`);
    }
  }

  return {
    name: 'vite-plugin-wcomp',
    async buildStart() {
      // 确保缓存目录存在
      if (!fs.existsSync(cacheDirPath)) {
        fs.mkdirSync(cacheDirPath, { recursive: true });
      }
    },
    async transform(code: string, id: string) {
      if (/\.(html|jsx|vue)$/.test(id)) {
        const matches = code.match(/<wc-[a-z0-9-_]+/ig) || [];
        const imports = new Set();
        let defines = new Set();

        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const tagName = match.slice(1); // remove '<' from match
          const componentName = tagName.replace('wc-', '');
          const componentPath = path.join(cacheDirPath, `${componentName}`);
          await cacheComponent(componentName);
          imports.add(`import { define as defineWebComponent${i} } from '${componentPath}';`);
          defines.add(`defineWebComponent${i}('${prefix}${componentName}');`);
        }

        if (imports.size > 0) {
          const importStatements = Array.from(imports).join('\n');
          const defineStatements = Array.from(defines).join('\n');
          const registerAllStatements = `${importStatements}\n${defineStatements}`;
          if (id.endsWith('.html')) {
            code = code.replace('</body>', `<script type="module">${registerAllStatements}</script></body>`);
          }
          else if (id.endsWith('.vue')) {
            const scriptSetupTag = /<script setup.*?>/;
            if (scriptSetupTag.test(code)) {
              code = code.replace(scriptSetupTag, `$&\n${registerAllStatements}`);
            } else {
              code = `<script setup>\n${registerAllStatements}\n</script>\n` + code;
            }
          } else {
            code = `${registerAllStatements}\n${code}`;
          }
        }
      }
      return null;
    }
  };
}