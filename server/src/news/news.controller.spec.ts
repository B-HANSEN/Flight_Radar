import { Test, TestingModule } from '@nestjs/testing'
import { NewsController } from './news.controller'
import { NewsService } from './news.service'
import { NewsItem } from './schemas/news-item.schema'

describe('NewsController', () => {
  let controller: NewsController
  const news: NewsItem[] = [
    {
      tag: 'operations',
      date: '02/08/2026',
      title: 'Sabadell tower frequency change effective now',
      summary:
        'The 8.33 kHz channel spacing update is live at LELL: TWR now runs on 120.805 MHz and GND on 121.605 MHz.',
    },
  ]
  const newsService = { findAll: jest.fn().mockResolvedValue(news) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [{ provide: NewsService, useValue: newsService }],
    }).compile()

    controller = app.get<NewsController>(NewsController)
  })

  it('returns the news items from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(news)
    expect(newsService.findAll).toHaveBeenCalled()
  })
})
