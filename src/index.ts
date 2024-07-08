import fs from 'fs-extra';
import path from "node:path";
import axios from 'axios';
import { Plugin } from 'vite';
const JSZip = require('jszip');

interface Options {
  cacheDir: string;
  prefix?: string;
}

export function wcomp(options?: Options): Plugin {
  const { prefix = 'wc-', cacheDir = './wcomp_modules' } = options || {};
  const cacheDirPath = path.resolve(process.cwd(), cacheDir);
  const wcompJsonPath = path.resolve(cacheDirPath, '../wcomp.json');
  if (!fs.existsSync(wcompJsonPath)) {
    fs.writeJSONSync(wcompJsonPath, {
      "dependencies": {}
    }, { spaces: 2 });
  }
  const wcompJson = fs.readJSONSync(wcompJsonPath);

  function isDirectoryEmpty(directoryPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          return reject(err);
        }
        resolve(files.length === 0);
      });
    });
  }

  const cacheComponent = async (componentName: string) => {
    const componentPath = path.join(cacheDirPath, componentName);
    if (!fs.existsSync(componentPath) || (await isDirectoryEmpty(componentPath))) {
      fs.mkdirSync(componentPath, { recursive: true });
      let version = wcompJson.dependencies[componentName];
      if (!version) {
        const url = `https://wcomp.zezeping.com/api/components/info/${componentName}/latest`;
        try {
          const { data: rData } = await axios({
            url,
            method: 'GET',
          })
          version = rData.version;
        } catch (error) {
          version = 'latest';
        }
        wcompJson.dependencies[componentName] = version;
        fs.writeJSONSync(wcompJsonPath, wcompJson, { spaces: 2 });
      }
      const url = `https://wcomp.zezeping.com/api/components/download/${componentName}/${version}`;
      console.info(`wcomp: begin download component: ${componentName}, to: ${componentPath}`);
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      const buffer = response.data;
      // 使用 JSZip 解压缩 ZIP 文件
      const zip = await JSZip.loadAsync(buffer);
      const zipEntries = Object.keys(zip.files);
      // 遍历 ZIP 文件中的所有条目
      for (const fileName of zipEntries) {
        const file = zip.files[fileName];
        const filePath = path.join(componentPath, fileName);

        if (file.dir) {
          // 创建目录
          fs.mkdirSync(filePath, { recursive: true });
        } else {
          // 创建文件及其目录
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          const content = await file.async('nodebuffer');
          fs.writeFileSync(filePath, content);
        }
      }
    }
  }

  return {
    name: 'vite-plugin-wcomp',
    enforce: 'pre',
    // configResolved(config) {
    // },
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
            const retCode = code.replace('</body>', `<script type="module">${registerAllStatements}</script></body>`);
            return {
              code: retCode,
              map: null
            }
          }
          else if (id.endsWith('.vue')) {
            const scriptSetupTag = /<script setup.*?>/;
            if (scriptSetupTag.test(code)) {
              const retCode = code.replace(scriptSetupTag, `$&\n${registerAllStatements}`);
              // console.log(1, retCode)
              return {
                code: retCode,
                map: null
              }
            } else {
              const retCode = `<script setup>\n${registerAllStatements}\n</script>\n` + code;
              // console.log(2, retCode)
              return {
                code: retCode,
                map: null
              }
            }
          } else {
            const retCode = `${registerAllStatements}\n${code}`;
            return {
              code: retCode,
              map: null
            }
          }
        }
      }
      return null;
    }
  };
}