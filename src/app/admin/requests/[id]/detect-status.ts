export function detectStatus(text: string): string | null {
  if (/成約|契約|決定/.test(text)) return "成約";
  if (/提案|送付|紹介/.test(text)) return "物件提案済";
  if (/見送り|キャンセル|不要|中止/.test(text)) return "見送り";
  if (/検索|対応|調査|確認/.test(text)) return "対応中";
  return null;
}
