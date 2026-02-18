import type {
  BookStatus,
} from '@/types';
import type { ReaderBookRepository } from '../../domain/ports/ReaderBookRepository';

export class GetReaderBookUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number) {
    return this.repository.getBook(bookId);
  }
}

export class GetReaderOcrStatusUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number) {
    return this.repository.getOcrStatus(bookId);
  }
}

export class GetReaderTextLayerQualityUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number) {
    return this.repository.getTextLayerQuality(bookId);
  }
}

export class UpdateReaderBookStatusUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number, status: BookStatus) {
    return this.repository.updateBookStatus(bookId, status);
  }
}

export class TriggerReaderOcrUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number) {
    return this.repository.triggerOcr(bookId);
  }
}

export class GetReaderBookFileUrlUseCase {
  constructor(private readonly repository: ReaderBookRepository) {}

  execute(bookId: number, version?: string | null) {
    return this.repository.getBookFileUrl(bookId, version);
  }
}

