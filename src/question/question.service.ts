import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SUCCESS_RESPONSE } from '../constants/response';
import { StatusResponse } from '../types/response';
import { exceptionHandler } from '../util/error';
import { Mood, moodList } from './types/question';
import { QUESTION_ACTIVATED_DATE_FORMAT } from '../constants/format';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  private updateQuestionTemplate(activated: boolean): (() => Promise<void>)[] {
    return moodList.map((mood) => async () => {
      const date = {
        activated_date: (activated
          ? moment().subtract(1, 'day')
          : moment()
        ).format(QUESTION_ACTIVATED_DATE_FORMAT),
      };
      const id = (
        await this.questionRepository.findOne({
          where: {
            activated,
            mood,
            ...(activated ? date : {}),
          },
          select: ['id'],
          ...(activated ? {} : { order: { id: 'DESC' } }),
        })
      )?.id;
      if (id) {
        await this.questionRepository.update(id, {
          activated: !activated,
          ...(activated ? {} : date),
        });
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
  async updateTodayQuestion() {
    setTimeout(async () => {
      await Promise.all([
        ...this.updateQuestionTemplate(true),
        ...this.updateQuestionTemplate(false),
      ]);
      console.log(
        `[${moment().format('YYYY-MM-DD HH:MM:SS')}] Question updated...`,
      );
    }, 1000);
  }

  async findQuestionById(id: string): Promise<Question> {
    return await this.questionRepository.findOne({ id });
  }

  async findQuestions(
    activated_date: string,
    mood: Mood = null,
  ): Promise<Question[]> {
    return await this.questionRepository.find({
      activated_date:
        activated_date === 'today'
          ? moment().format(QUESTION_ACTIVATED_DATE_FORMAT)
          : activated_date,
      activated: true,
      ...(mood ? { mood } : {}),
    });
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto[],
  ): Promise<StatusResponse> {
    try {
      const questions = [];
      for (const questionDto of createQuestionDto) {
        const newQuestion = await this.questionRepository.create(questionDto);
        questions.push(newQuestion);
      }
      await this.questionRepository.save(questions);
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }

  async deleteQuestion(id: string): Promise<StatusResponse> {
    try {
      await this.questionRepository.delete(id);
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }
}
