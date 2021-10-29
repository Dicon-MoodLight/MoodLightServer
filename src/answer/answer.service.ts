import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entity/answer.entity';
import { Repository } from 'typeorm';
import { StatusResponse } from '../types/response';
import { SUCCESS_RESPONSE } from '../constants/response';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QuestionService } from '../question/question.service';
import { exceptionHandler } from '../util/error';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { moodList } from '../question/types/question';
import { CountOfAnswerResponseDto } from './dto/count-of-answer-response.dto';
import { IDeleteRequest } from '../types/delete';
import { AddAnswerLikeDto } from './dto/add-answer-like.dto';
import { AnswerLike } from './entity/answer-like.entity';
import {
  AnswerIncludeIsLikeAndQuestionDto,
  AnswerIncludeIsLikeDto,
} from './dto/answer-include-is-like.dto';
import { AnswerIncludesQuestionDto } from './dto/answer-includes-question.dto';

interface IFindAnswers {
  readonly userId: any;
  readonly skip: number;
  readonly take: number;
  readonly questionId?: string;
}

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(AnswerLike)
    private readonly answerLikeRepository: Repository<AnswerLike>,
    private readonly questionService: QuestionService,
  ) {}

  async answersIncludeIsLikePipeline<
    T extends AnswerIncludeIsLikeDto | AnswerIncludeIsLikeAndQuestionDto,
  >({
    answers,
    userId,
  }: {
    answers: AnswerIncludesQuestionDto[] | Answer[];
    userId: string;
  }): Promise<T[]> {
    const newAnswers: T[] = [];
    for (const answer of answers) {
      const isLike = !!(await this.findAnswerLikeByUserIdAndAnswerId({
        userId,
        answerId: answer.id,
      }));
      newAnswers.push({ isLike, ...answer } as T);
    }
    return newAnswers;
  }

  async getCountOfAnswers(
    activatedDate: string,
  ): Promise<CountOfAnswerResponseDto[]> {
    const countOfAnswers: CountOfAnswerResponseDto[] = [];
    for (const mood of moodList) {
      const count = await this.answerRepository.count({
        question: { mood, activatedDate },
      });
      countOfAnswers.push({ mood, count });
    }
    return countOfAnswers;
  }

  async findAnswerById(id: number): Promise<Answer> {
    return await this.answerRepository.findOne({ id });
  }

  async findMyAnswers({
    userId,
    skip,
    take,
  }: IFindAnswers): Promise<AnswerIncludesQuestionDto[]> {
    return await this.answerRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
      relations: ['question'],
      skip,
      take,
    });
  }

  async findAnswers({
    questionId,
    userId,
    skip,
    take,
  }: IFindAnswers): Promise<Answer[]> {
    return await this.answerRepository.find({
      where: { question: { id: questionId }, private: false },
      order: { user: userId, id: 'DESC' },
      skip,
      take,
    });
  }

  async findAnswerLikeByUserIdAndAnswerId({
    userId,
    answerId,
  }: {
    userId: string;
    answerId: number;
  }): Promise<AnswerLike> {
    return await this.answerLikeRepository.findOne({
      user: { id: userId },
      answer: { id: answerId },
    });
  }

  private async createAnswerLike({ userId, answerId }): Promise<void> {
    const newAnswerLike = await this.answerLikeRepository.create({
      user: { id: userId },
      answer: { id: answerId },
    });
    await this.answerLikeRepository.save(newAnswerLike);
  }

  async addAnswerLike({
    userId,
    answerId,
  }: AddAnswerLikeDto): Promise<StatusResponse> {
    try {
      const { likes } = await this.findAnswerById(answerId);
      const answerLikeIsExist = !!(await this.findAnswerLikeByUserIdAndAnswerId(
        {
          userId,
          answerId,
        },
      ));
      if (!answerLikeIsExist) {
        await Promise.all([
          this.createAnswerLike({ userId, answerId }),
          this.answerRepository.update(answerId, { likes: likes + 1 }),
        ]);
      }
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }

  async removeAnswerLike({
    userId,
    answerId,
  }: AddAnswerLikeDto): Promise<StatusResponse> {
    try {
      const { likes } = await this.findAnswerById(answerId);
      await Promise.all([
        this.answerLikeRepository.delete({
          user: { id: userId },
          answer: { id: answerId },
        }),
        this.answerRepository.update(answerId, { likes: likes - 1 }),
      ]);
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }

  async createAnswer({
    userId,
    questionId,
    ...createAnswerDto
  }: CreateAnswerDto): Promise<StatusResponse> {
    try {
      const question = await this.questionService.findQuestionById(questionId);
      if (!question.activated) {
        throw 'Question is not activated.';
      }
      const answer = await this.answerRepository.create({
        ...createAnswerDto,
        user: { id: userId },
        question: { id: questionId },
      });
      await this.answerRepository.save(answer);
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }

  async updateAnswer({
    answerId,
    userId,
    ...updateAnswerDto
  }: UpdateAnswerDto): Promise<StatusResponse> {
    try {
      await this.answerRepository.update(
        { id: answerId, user: { id: userId } },
        updateAnswerDto,
      );
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }

  async deleteAnswer({ id, userId }: IDeleteRequest): Promise<StatusResponse> {
    try {
      await this.answerRepository.delete({ id, user: { id: userId } });
    } catch (err) {
      exceptionHandler(err);
    }
    return SUCCESS_RESPONSE;
  }
}
