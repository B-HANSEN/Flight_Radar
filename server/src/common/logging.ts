import { Logger } from '@nestjs/common'

// Runs `run` and returns its result untouched. If it rejects, writes one
// `logger.error` line — `<context> failed` plus the stack — through the
// given service's logger, then rethrows the same error. Nothing is logged
// on success. Wrap only the persistence call so an unexpected DB failure
// leaves a searchable server-side trace instead of only a bare 500 on the
// wire; keep an expected domain throw (a NotFoundException the caller
// raises after this resolves) outside it — that's not a defect.
export async function withErrorLogging<T>(
  logger: Logger,
  context: string,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run()
  } catch (error) {
    logger.error(
      `${context} failed`,
      error instanceof Error ? error.stack : String(error),
    )
    throw error
  }
}
