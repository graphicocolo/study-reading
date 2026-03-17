/**
 * アプリケーションの定数
 */

/** デフォルトの作業時間（分） */
export const DEFAULT_WORK_MINUTES = 25

/** デフォルトの作業時間（秒） */
export const DEFAULT_WORK_SECONDS = 0

/** デフォルトの休憩時間（分） */
export const DEFAULT_BREAK_MINUTES = 5

/** デフォルトの休憩時間（秒） */
export const DEFAULT_BREAK_SECONDS = 0

/** 最小の分数 */
export const MIN_MINUTES = 0

/** 最大の分数 */
export const MAX_MINUTES = 99

/** 最小の秒数 */
export const MIN_SECONDS = 0

/** 最大の秒数 */
export const MAX_SECONDS = 59

/** デフォルトの音量 */
export const DEFAULT_VOLUME = 0.5

/** 作業終了時の音声ファイルパス */
export const WORK_END_SOUND_PATH = '/sounds/work-end.mp3'

/** 休憩終了時の音声ファイルパス */
export const BREAK_END_SOUND_PATH = '/sounds/break-end.mp3'

/** ローカルストレージのキー */
// const アサーションで型付けすることで変わらない値を宣言
// 現在 THEME のみ使用
// 他の値は、将来的に設定を永続化する機能を追加するために備えている
export const STORAGE_KEYS = {
  THEME: 'pomodoro-theme',
  WORK_TIME: 'pomodoro-work-time',
  BREAK_TIME: 'pomodoro-break-time',
  VOLUME: 'pomodoro-volume',
  MUTED: 'pomodoro-muted',
} as const
