import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { get, put } from '@vercel/blob'
import { Readable } from 'node:stream'
import type { ReadableStream } from 'node:stream/web'

// Thin wrapper around @vercel/blob so the rest of the module (and its tests)
// never touch the SDK or the token directly. Every blob is private: the API
// streams it back to the browser, so a blob URL alone grants nothing.
@Injectable()
export class BlobStorageService {
  constructor(private readonly config: ConfigService) {}

  private token(): string {
    const token = this.config.get<string>('BLOB_READ_WRITE_TOKEN')
    if (!token) {
      throw new ServiceUnavailableException('File storage is not configured')
    }
    return token
  }

  async upload(
    pathname: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const blob = await put(pathname, body, {
      access: 'private',
      addRandomSuffix: true,
      contentType,
      token: this.token(),
    })
    return blob.pathname
  }

  async download(pathname: string): Promise<Readable> {
    const result = await get(pathname, {
      access: 'private',
      token: this.token(),
    })
    if (result?.statusCode !== 200) {
      throw new NotFoundException(`Blob ${pathname} not found`)
    }
    // The SDK hands back a DOM ReadableStream; Express pipes Node streams.
    return Readable.fromWeb(result.stream as ReadableStream<Uint8Array>)
  }
}
