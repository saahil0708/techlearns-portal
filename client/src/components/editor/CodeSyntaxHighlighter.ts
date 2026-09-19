/**
 * Lightweight, zero-dependency token syntax highlighter for C++, Python, Java, JS, TS, Go, Rust.
 */

export interface Token {
  type: 'keyword' | 'type' | 'string' | 'comment' | 'number' | 'function' | 'directive' | 'operator' | 'punctuation' | 'plain';
  text: string;
}

const KEYWORDS_BY_LANG: Record<string, Set<string>> = {
  cpp: new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept',
    'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t',
    'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
    'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete',
    'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float',
    'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
    'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public',
    'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof',
    'static', 'static_assert', 'static_cast', 'struct', 'switch', 'synchronized', 'template',
    'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union',
    'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq', 'include', 'define'
  ]),
  python: new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
    'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
  ]),
  java: new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
    'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
    'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
    'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
    'volatile', 'while', 'record', 'sealed', 'permits', 'var'
  ]),
  javascript: new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in',
    'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
    'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'null', 'undefined', 'true', 'false'
  ]),
  typescript: new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in',
    'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
    'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'null', 'undefined', 'true', 'false',
    'type', 'interface', 'namespace', 'declare', 'abstract', 'as', 'implements', 'readonly', 'keyof'
  ]),
  go: new Set([
    'break', 'default', 'func', 'interface', 'select', 'case', 'defer', 'go', 'map', 'struct',
    'chan', 'else', 'goto', 'package', 'switch', 'const', 'fallthrough', 'if', 'range', 'type',
    'continue', 'for', 'import', 'return', 'var', 'nil', 'true', 'false', 'make', 'len', 'cap', 'append'
  ]),
  rust: new Set([
    'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern',
    'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub',
    'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe',
    'use', 'where', 'while', 'println', 'format', 'vec', 'panic'
  ]),
};

const COMMON_TYPES = new Set([
  'int', 'long', 'float', 'double', 'char', 'bool', 'void', 'size_t', 'uint32_t', 'uint64_t',
  'int32_t', 'int64_t', 'string', 'vector', 'map', 'unordered_map', 'set', 'unordered_set',
  'queue', 'deque', 'stack', 'pair', 'tuple', 'list', 'priority_queue',
  'String', 'Integer', 'Long', 'Double', 'Boolean', 'List', 'ArrayList', 'HashMap', 'HashSet', 'Scanner',
  'number', 'boolean', 'any', 'unknown', 'never', 'Array', 'Record', 'Promise',
  'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize', 'f32', 'f64',
  'Vec', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err', 'String', 'str'
]);

export function tokenizeCode(code: string, lang: string = 'cpp'): Token[] {
  const tokens: Token[] = [];
  const keywords = KEYWORDS_BY_LANG[lang] || KEYWORDS_BY_LANG['cpp'];

  // Combined Regex for Token Matching
  const tokenRegex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[A-Za-z_]\w*\b)|([+\-*/%=&|<>!^~?:.]+)|([{}()\[\];,])|(\s+)/g;

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(code)) !== null) {
    const [full, commentOrDirective, str, num, ident, op, punct, space] = match;

    if (commentOrDirective) {
      if (commentOrDirective.startsWith('#')) {
        tokens.push({ type: 'directive', text: commentOrDirective });
      } else {
        tokens.push({ type: 'comment', text: commentOrDirective });
      }
    } else if (str) {
      tokens.push({ type: 'string', text: str });
    } else if (num) {
      tokens.push({ type: 'number', text: num });
    } else if (ident) {
      if (keywords.has(ident)) {
        tokens.push({ type: 'keyword', text: ident });
      } else if (COMMON_TYPES.has(ident) || /^[A-Z][A-Za-z0-9_]*$/.test(ident)) {
        tokens.push({ type: 'type', text: ident });
      } else {
        // Look ahead for function call
        const rest = code.slice(tokenRegex.lastIndex);
        if (/^\s*\(/.test(rest)) {
          tokens.push({ type: 'function', text: ident });
        } else {
          tokens.push({ type: 'plain', text: ident });
        }
      }
    } else if (op) {
      tokens.push({ type: 'operator', text: op });
    } else if (punct) {
      tokens.push({ type: 'punctuation', text: punct });
    } else if (space) {
      tokens.push({ type: 'plain', text: space });
    } else {
      tokens.push({ type: 'plain', text: full });
    }
  }

  return tokens;
}

export const THEME_COLOR_MAP: Record<string, { bg: string; text: string; keyword: string; type: string; string: string; comment: string; number: string; function: string; directive: string; operator: string; gutterBg: string; activeLine: string }> = {
  vscodeDark: {
    bg: '#1E1E1E',
    text: '#D4D4D4',
    keyword: '#569CD6',
    type: '#4EC9B0',
    string: '#CE9178',
    comment: '#6A9955',
    number: '#B5CEA8',
    function: '#DCDCAA',
    directive: '#C586C0',
    operator: '#D4D4D4',
    gutterBg: '#1E1E1E',
    activeLine: 'rgba(255, 255, 255, 0.04)',
  },
  oneDarkPro: {
    bg: '#282C34',
    text: '#ABB2BF',
    keyword: '#C678DD',
    type: '#E5C07B',
    string: '#98C379',
    comment: '#5C6370',
    number: '#D19A66',
    function: '#61AFEF',
    directive: '#E06C75',
    operator: '#56B6C2',
    gutterBg: '#21252B',
    activeLine: 'rgba(255, 255, 255, 0.05)',
  },
  nightOwl: {
    bg: '#011627',
    text: '#d6deeb',
    keyword: '#c792ea',
    type: '#ffcb8b',
    string: '#ecc48d',
    comment: '#637777',
    number: '#f78c6c',
    function: '#82aaff',
    directive: '#7fdbca',
    operator: '#c792ea',
    gutterBg: '#01111d',
    activeLine: 'rgba(255, 255, 255, 0.06)',
  },
  deepSpace: {
    bg: '#0B0F19',
    text: '#E2E8F0',
    keyword: '#38BDF8',
    type: '#A78BFA',
    string: '#34D399',
    comment: '#64748B',
    number: '#FBBF24',
    function: '#60A5FA',
    directive: '#F472B6',
    operator: '#94A3B8',
    gutterBg: '#080C14',
    activeLine: 'rgba(56, 189, 248, 0.06)',
  },
};
