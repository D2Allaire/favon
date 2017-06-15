export default {
  /**
   * Default Anime Episode Parser. Matches explicit S01E01 values. Examples:
   * [HorribleSubs] Gi(a)rlish Number S01E12
   * [Coalgirls]_Owarimonogatari_S01E07_(1280x720_Blu-ray_FLAC)
   * [Coalgirls].Guilty.Crown.S01E02.[1920x1080].[Blu-ray].[FLAC]
   */
  explicit: /^(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_.]*))*((?:(?:[^\s_.-]+)(?:\b|[\s_.-]))*)(?:(?:\b|[\s_.-]*))+S(\d{1,3})E(\d{1,3})(?:[^\\/]*$)/i,

  /**
   * Match anime credits (OP / ED / NCOP / NCED)
   */
  credits: /^(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*((?:(?:[^\s_.-]+)(?:\b|[\s_.-]))*)(?:(?:\b|[\s_.-]*))+((?:OP|ED|NCOP|NCED)(?:\d)?)(?:\b|[\s_.-]*)(?:\w+[\s_.-]*)*?(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*(?:[[({][\da-f]{8}[)}\]])?(?:[^\\/]*$)/i,

  /**
   * Matches anime specials (Special / SP / OVA / OAV / Picture Drama / Movie). Examples:
   * [gleam] Kurenai OVA - 01 [OAD][0e73f000]
   * Hakuouki Movie Shikon Soukyuu - Movie 2 [1080p]
   * [MaverickSubs] Third Aerial Girls Squad - OVA 2 (Shirobako Vol.7 OVA) [1080p]
   */
  specialBefore: /^(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*((?:(?:[^\s_.-]+)(?:\b|[\s_.-]))*)(?:(?:\b|[\s_.-]*))+(?:Special|SP|OVA|OAV|Picture Drama|Movie)(?:(?:\b|[\s_.-]*)(\d{1,3})(?:[_ ]?v\d)?[\s_.-]*)(?![^([{]*\b\d{1,3}(?:[_\s]?v\d+)?\b)(?:\w+[\s_.-]*)*?(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*(?:[[({][\da-f]{8}[)}\]])?(?:[^\\/]*$)/i,

  /**
   * Same as above, but matches files where the episode number comes before the special indicator. Example:
   * [MaverickSubs] Third Aerial Girls Squad - 02 - OVA (Shirobako Vol.7 OVA) [1080p]
   */
  specialAfter: /^(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*((?:(?:[^\s_.-]+)(?:\b|[\s_.-]))*)(?:(?:\b|[\s_.-]*))+(?:(?:\b|[\s_.-]*)(\d{1,3})(?:[_ ]?v\d)?[\s_.-]+)(?:Special|SP|OVA|OAV|Picture Drama|Movie)(?![^([{]*\b\d{1,3}(?:[_\s]?v\d+)?\b)(?:\w+[\s_.-]*)*?(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*(?:[[({][\da-f]{8}[)}\]])?(?:[^\\/]*$)/i,

  /**
   * Match episodes that include a season marker in the title. Examples:
   * [CoalGuys] K-ON!! S2 - 05 [4B19B10F]
   * [DeadFish] Toaru Kagaku no Railgun S - S2 - 01 [720p][AAC].mp4
   */
  default: /^(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_.]*))*((?:(?!\sS(?:eason ?)?\d{1,3})(?!\s-\s).)*)(?:\b|[\s-]*)+(?:(?:[[(]?\d{4}[)\]]?)(?:(?:\b|[\s_.-]*))+)?(?:S(?:eason ?)?(\d{1,3})[\s_.\-x]*)?(?:(?:Ep?(?:isode[ ._])?[ _.]?)?(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:[_ ]?v\d)?[\s_.-]*)(?![^([{]*\b\d{1,3}(?:[_\s]?v\d+)?\b)(?:\w+[\s_.-]*)*?(?:(?:\[[^\]]+\]|\([^)]+\)|\{[^}]+\})(?:[\s_]*))*(?:[[({][\da-f]{8}[\])}])?(?:[^\\/]*$)/i,

  /**
   * Fallback, try to match title, season and episode from previously cleaned up string.
   */
  fallback: /^((?:(?!\sS(?:eason ?)?\d{1,3})(?!\s-\s).)*)(?:\b|[\s-]*)+(?:S(?:eason ?)?(\d{1,3})[\s_.\-x]*)?(?:\b|[\s-])*(?:(?:Ep?(?:isode[ ._])?[ _.]?)?(\d{1,3}(?:-\d{1,3})?(?:\.\d)?)(?:[_ ]?v\d)?)/i,

};
