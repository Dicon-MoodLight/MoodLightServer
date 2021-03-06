import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export const SWAGGER_OPTION = new DocumentBuilder()
  .setTitle('Mood light')
  .setDescription('Mood light 서버 API 문서입니다.')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      in: 'header',
      bearerFormat: 'JWT',
      description: '인증 토큰을 입력하세요',
    },
    'Authorization',
  )
  .build();

export const SWAGGER_DOCUMENT: OpenAPIObject = {
  openapi: '3.0.0',
  paths: {
    '/': {
      get: {
        operationId: 'AppController_getHello',
        parameters: [],
        responses: { '200': { description: '' } },
      },
    },
    '/auth': {
      get: {
        operationId: 'AuthController_authorization',
        summary: '자신의 사용자 정보 가져오기',
        parameters: [],
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        tags: ['Auth'],
        security: [{ bearer: [] }],
      },
    },
    '/auth/join': {
      post: {
        operationId: 'AuthController_join',
        summary: '가입 요청',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JoinDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
      },
    },
    '/auth/confirm': {
      post: {
        operationId: 'AuthController_confirm',
        summary: '가입 인증',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConfirmDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
      },
    },
    '/auth/confirm-check': {
      post: {
        operationId: 'AuthController_checkConfirmCode',
        summary: '인증번호 확인',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConfirmDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
      },
    },
    '/auth/login': {
      post: {
        operationId: 'AuthController_login',
        summary: '로그인',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaveFirebaseTokenOfUserDto',
              },
            },
          },
        },
        responses: {
          '200': { description: '{ accessToken: string; }' },
          '401': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
        security: [{ bearer: [] }],
      },
    },
    '/auth/change-password': {
      post: {
        operationId: 'AuthController_changePassword',
        summary: '비밀번호 변경',
        description: '로그인 상태에서의 비밀번호 변경을 의미합니다.',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
        security: [{ bearer: [] }],
      },
    },
    '/auth/find-password': {
      post: {
        operationId: 'AuthController_findPassword',
        summary: '비밀번호 찾기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserEmailDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
      },
    },
    '/auth/confirm-find-password': {
      post: {
        operationId: 'AuthController_confirmFindPassword',
        summary: '비밀번호 찾기 인증',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ConfirmChangePasswordNotLoggedInDto',
              },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Auth'],
      },
    },
    '/question': {
      get: {
        operationId: 'QuestionController_findQuestions',
        summary: '질문 가져오기',
        description:
          '오늘의 질문들을 가져오려면 date 에 today 를 대신 입력하세요.\n\n쿼리를 모두 비우면 전체 질문 리스트를 전송합니다.',
        parameters: [
          {
            name: 'date',
            required: false,
            in: 'query',
            description: '활성화 날짜 (YYYY-MM-DD)',
            schema: { type: 'string' },
          },
          {
            name: 'mood',
            required: false,
            in: 'query',
            description: '기분 [sad,angry,happy]',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Question' },
                },
              },
            },
          },
        },
        tags: ['Question'],
      },
      post: {
        operationId: 'QuestionController_createQuestion',
        summary: '질문 등록하기',
        description:
          '질문을 등록하면 지정한 활성화 날짜에 오늘의 질문로 활성화됩니다.',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateQuestionDto' },
            },
          },
        },
        responses: {
          '201': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Question'],
        security: [{ bearer: [] }],
      },
      put: {
        operationId: 'QuestionController_updateQuestion',
        summary: '질문 수정하기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateQuestionDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Question'],
        security: [{ bearer: [] }],
      },
    },
    '/question/{questionId}': {
      delete: {
        operationId: 'QuestionController_deleteQuestion',
        summary: '질문 삭제하기',
        parameters: [
          {
            name: 'questionId',
            required: true,
            in: 'path',
            description: '질문 id',
            schema: { type: 'string' },
          },
        ],
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Question'],
        security: [{ bearer: [] }],
      },
    },
    '/user/exist': {
      get: {
        operationId: 'UserController_getUserIsExist',
        summary: '사용자 이메일 or 닉네임 가입 여부 확인',
        parameters: [
          {
            name: 'email',
            required: false,
            in: 'query',
            description: '사용자 이메일',
            schema: { type: 'string' },
          },
          {
            name: 'nickname',
            required: false,
            in: 'query',
            description: '사용자 닉네임',
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'exist: boolean;' } },
        tags: ['User'],
      },
    },
    '/user/{userId}': {
      get: {
        operationId: 'UserController_findUserById',
        summary: '다른 사용자 정보 가져오기',
        parameters: [
          {
            name: 'userId',
            required: true,
            in: 'path',
            description: '사용자 아이디',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        tags: ['User'],
      },
    },
    '/user': {
      put: {
        operationId: 'UserController_updateUser',
        summary: '사용자 정보 업데이트',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['User'],
        security: [{ bearer: [] }],
      },
      delete: {
        operationId: 'UserController_deleteUser',
        summary: '사용자 탈퇴',
        parameters: [],
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['User'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/count/{activatedDate}': {
      get: {
        operationId: 'AnswerController_getCountOfAnswers',
        summary: '기분별 답변 개수 가져오기',
        parameters: [
          {
            name: 'activatedDate',
            required: true,
            in: 'path',
            description: '활성화 날짜 (YYYY-MM-DD)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CountOfAnswerResponseDto',
                  },
                },
              },
            },
          },
        },
        tags: ['Answer'],
      },
    },
    '/answer/my/all': {
      get: {
        operationId: 'AnswerController_findAllMyAnswers',
        summary: '자신의 답변 리스트 가져오기 (전체)',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnswerIncludeIsLikeAndQuestionDto',
                  },
                },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/my/exist/{activatedDate}': {
      get: {
        operationId: 'AnswerController_getMyAnswerIsExist',
        summary: '자신의 답변 여부 확인',
        parameters: [
          {
            name: 'activatedDate',
            required: true,
            in: 'path',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExistResponseDto' },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/my': {
      get: {
        operationId: 'AnswerController_findMyAnswers',
        summary: '자신의 답변 리스트 가져오기 (최신순)',
        parameters: [
          {
            name: 'start',
            required: true,
            in: 'query',
            description: '리스트 마지막 원소 id / 첫 로딩에는 0',
            schema: { type: 'number' },
          },
          {
            name: 'take',
            required: true,
            in: 'query',
            description: '가져올 리스트 원소 갯수',
            schema: { type: 'number' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnswerIncludeIsLikeAndQuestionDto',
                  },
                },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/{questionId}': {
      get: {
        operationId: 'AnswerController_findAnswers',
        summary: '답변 리스트 가져오기 (최신순)',
        description: '다른 사용자의 답변도 포함됩니다.',
        parameters: [
          {
            name: 'questionId',
            required: true,
            in: 'path',
            description: '질문 id',
            schema: { type: 'string' },
          },
          {
            name: 'start',
            required: true,
            in: 'query',
            description: '리스트 마지막 원소 id / 첫 로딩에는 0',
            schema: { type: 'number' },
          },
          {
            name: 'take',
            required: true,
            in: 'query',
            description: '가져올 리스트 원소 갯수',
            schema: { type: 'number' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnswerIncludeIsLikeDto',
                  },
                },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/like/{isLike}': {
      put: {
        operationId: 'AnswerController_processAnswerLike',
        summary: '답변 좋아요 처리',
        parameters: [
          {
            name: 'isLike',
            required: true,
            in: 'path',
            description: '추가는 true, 취소는 false',
            schema: { type: 'boolean' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddAnswerLikeDto' },
            },
          },
        },
        responses: {
          '201': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer': {
      post: {
        operationId: 'AnswerController_createAnswer',
        summary: '답변 생성하기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAnswerDto' },
            },
          },
        },
        responses: {
          '201': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
      put: {
        operationId: 'AnswerController_updateAnswer',
        summary: '답변 수정하기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAnswerDto' },
            },
          },
        },
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/answer/{answerId}': {
      delete: {
        operationId: 'AnswerController_deleteAnswer',
        summary: '답변 삭제하기',
        parameters: [
          {
            name: 'answerId',
            required: true,
            in: 'path',
            description: '답변 id',
            schema: { type: 'number' },
          },
        ],
        responses: {
          default: {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Answer'],
        security: [{ bearer: [] }],
      },
    },
    '/comment/{answerId}': {
      get: {
        operationId: 'CommentController_findComments',
        summary: '댓글 리스트 가져오기 (최신순)',
        parameters: [
          {
            name: 'answerId',
            required: true,
            in: 'path',
            schema: { type: 'number' },
          },
          {
            name: 'start',
            required: true,
            in: 'query',
            description: '리스트 마지막 원소 id / 첫 로딩에는 0',
            schema: { type: 'number' },
          },
          {
            name: 'take',
            required: true,
            in: 'query',
            description: '가져올 리스트 원소 갯수',
            schema: { type: 'number' },
          },
        ],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Comment' },
                },
              },
            },
          },
        },
        tags: ['Comment'],
        security: [{ bearer: [] }],
      },
    },
    '/comment/count/{answerId}': {
      get: {
        operationId: 'CommentController_getCount',
        summary: '댓글 갯수 가져오기',
        parameters: [
          {
            name: 'answerId',
            required: true,
            in: 'path',
            schema: { type: 'number' },
          },
        ],
        responses: { '200': { description: '' } },
        tags: ['Comment'],
      },
    },
    '/comment': {
      post: {
        operationId: 'CommentController_createComment',
        summary: '댓글 생성하기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCommentDto' },
            },
          },
        },
        responses: {
          '201': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Comment'],
        security: [{ bearer: [] }],
      },
      put: {
        operationId: 'CommentController_updateComment',
        summary: '댓글 수정하기',
        parameters: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCommentDto' },
            },
          },
        },
        responses: {
          '201': {
            description: '',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponseDto' },
              },
            },
          },
        },
        tags: ['Comment'],
        security: [{ bearer: [] }],
      },
    },
    '/comment/{id}': {
      delete: {
        operationId: 'CommentController_deleteComment',
        summary: '댓글 삭제하기',
        parameters: [
          {
            name: 'id',
            required: true,
            in: 'path',
            schema: { type: 'number' },
          },
        ],
        responses: { '200': { description: '' } },
        tags: ['Comment'],
        security: [{ bearer: [] }],
      },
    },
  },
  info: {
    title: 'Mood light',
    description: 'Mood light 서버 API 문서입니다.',
    version: '1.0.0',
    contact: {},
  },
  tags: [],
  servers: [],
  components: {
    securitySchemes: {
      Authorization: {
        scheme: 'bearer',
        bearerFormat: 'JWT',
        type: 'http',
        in: 'header',
        description: '인증 토큰을 입력하세요',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '사용자 아이디' },
          nickname: { type: 'string', description: '닉네임' },
          email: { type: 'string', description: '이메일' },
          password: { type: 'string', description: '비밀번호' },
          is_admin: { type: 'boolean', description: '관리자 여부' },
          usePushMessage: {
            type: 'boolean',
            description: '푸시알림 사용 여부',
          },
          firebaseToken: {
            type: 'string',
            description: '파이어베이스 다바이스 토큰',
          },
          created_date: {
            format: 'date-time',
            type: 'string',
            description: '가입일',
          },
        },
        required: [
          'id',
          'nickname',
          'email',
          'password',
          'is_admin',
          'usePushMessage',
          'firebaseToken',
          'created_date',
        ],
      },
      JoinDto: {
        type: 'object',
        properties: {
          nickname: { type: 'string', description: '사용자 닉네임' },
          email: { type: 'string', description: '사용자 이메일' },
          password: { type: 'string', description: '비밀번호' },
          adminKey: { type: 'string', description: '관리자 키' },
        },
        required: ['nickname', 'email', 'password'],
      },
      StatusResponseDto: {
        type: 'object',
        properties: {
          success: { type: 'boolean', description: '성공 여부' },
          message: {
            type: 'string',
            description:
              '에러 메세지 (실패할 경우)\n\n [Unauthorized.,Verification does not exists.,User does not exist.,User does not admin.,Question is not activated.,Answer is private.,error,Email already exists.,Nickname already exists.]',
          },
        },
        required: ['success', 'message'],
      },
      ConfirmDto: {
        type: 'object',
        properties: {
          email: { type: 'string', description: '사용자 이메일' },
          confirmCode: { type: 'string', description: '인증 코드' },
        },
        required: ['email', 'confirmCode'],
      },
      SaveFirebaseTokenOfUserDto: {
        type: 'object',
        properties: {
          email: { type: 'string', description: '사용자 이메일' },
          password: { type: 'string', description: '비밀번호' },
          firebaseToken: {
            type: 'string',
            description: '파이어베이스 디바이스 토큰',
          },
        },
        required: ['email', 'password', 'firebaseToken'],
      },
      ChangePasswordDto: {
        type: 'object',
        properties: {
          password: { type: 'string', description: '비밀번호' },
          newPassword: { type: 'string', description: '새 비밀번호' },
        },
        required: ['password', 'newPassword'],
      },
      UserEmailDto: {
        type: 'object',
        properties: { email: { type: 'string', description: '사용자 이메일' } },
        required: ['email'],
      },
      ConfirmChangePasswordNotLoggedInDto: {
        type: 'object',
        properties: {
          email: { type: 'string', description: '사용자 이메일' },
          confirmCode: { type: 'string', description: '인증 코드' },
          password: { type: 'string', description: '비밀번호' },
        },
        required: ['email', 'confirmCode', 'password'],
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '질문 아이디' },
          mood: { type: 'string', description: '기분' },
          contents: { type: 'string', description: '질문 텍스트' },
          activated: { type: 'boolean', description: '오늘의 질문 채택 여부' },
          activatedDate: {
            type: 'string',
            description: '오늘의 질문 채택 날짜',
          },
        },
        required: ['id', 'mood', 'contents', 'activated', 'activatedDate'],
      },
      CreateQuestionDto: {
        type: 'object',
        properties: {
          contents: { type: 'string', description: '질문 내용' },
          mood: { type: 'string', description: '기분' },
          activatedDate: {
            type: 'string',
            description: '활성화 날짜 YYYY-MM-DD',
          },
        },
        required: ['contents', 'mood', 'activatedDate'],
      },
      UpdateQuestionDto: {
        type: 'object',
        properties: {
          questionId: { type: 'string', description: '질문 id' },
          contents: { type: 'string', description: '질문 내용' },
          mood: { type: 'string', description: '기분' },
          activatedDate: {
            type: 'string',
            description: '활성화 날짜 YYYY-MM-DD',
          },
        },
        required: ['questionId'],
      },
      UpdateUserDto: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: '사용자 아이디' },
          nickname: { type: 'string', description: '사용자 닉네임' },
          usePushMessage: {
            type: 'boolean',
            description: '푸시알림 사용 여부',
          },
        },
        required: ['userId'],
      },
      CountOfAnswerResponseDto: {
        type: 'object',
        properties: {
          mood: { type: 'string', description: '기분' },
          count: { type: 'number', description: '갯수' },
        },
        required: ['mood', 'count'],
      },
      AnswerIncludeIsLikeAndQuestionDto: {
        type: 'object',
        properties: {
          id: { type: 'number', description: '답변 아이디' },
          contents: { type: 'string', description: '답변 텍스트' },
          private: { type: 'boolean', description: '비공개 여부' },
          moodLevel: { type: 'number', description: '감정 수치' },
          countOfComment: { type: 'number', description: '댓글 갯수' },
          likes: { type: 'number', description: '좋아요 갯수' },
          createdDate: {
            format: 'date-time',
            type: 'string',
            description: '생성일',
          },
          question: {
            description: '질문 데이터',
            allOf: [{ $ref: '#/components/schemas/Question' }],
          },
          isLike: { type: 'boolean', description: '좋아요 클릭 여부' },
        },
        required: ['question', 'isLike'],
      },
      ExistResponseDto: {
        type: 'object',
        properties: { exist: { type: 'boolean', description: '존재 여부' } },
        required: ['exist'],
      },
      AnswerIncludeIsLikeDto: {
        type: 'object',
        properties: {
          id: { type: 'number', description: '답변 아이디' },
          contents: { type: 'string', description: '답변 텍스트' },
          private: { type: 'boolean', description: '비공개 여부' },
          moodLevel: { type: 'number', description: '감정 수치' },
          countOfComment: { type: 'number', description: '댓글 갯수' },
          likes: { type: 'number', description: '좋아요 갯수' },
          createdDate: {
            format: 'date-time',
            type: 'string',
            description: '생성일',
          },
          isLike: { type: 'boolean', description: '좋아요 클릭 여부' },
        },
        required: ['isLike'],
      },
      AddAnswerLikeDto: {
        type: 'object',
        properties: { answerId: { type: 'number', description: '답변 id' } },
        required: ['answerId'],
      },
      CreateAnswerDto: {
        type: 'object',
        properties: {
          questionId: { type: 'string', description: '질문 id' },
          moodLevel: { type: 'number', description: '감정 수치' },
          private: { type: 'boolean', description: '비공개 여부' },
          allow_comment: { type: 'boolean', description: '댓글 허용 여부' },
          contents: { type: 'string', description: '답변 내용' },
        },
        required: ['questionId', 'moodLevel', 'contents'],
      },
      UpdateAnswerDto: {
        type: 'object',
        properties: {
          questionId: { type: 'string', description: '질문 id' },
          moodLevel: { type: 'number', description: '감정 수치' },
          private: { type: 'boolean', description: '비공개 여부' },
          allow_comment: { type: 'boolean', description: '댓글 허용 여부' },
          contents: { type: 'string', description: '답변 내용' },
          answerId: { type: 'number', description: '답변 id' },
        },
        required: ['answerId'],
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'number', description: '댓글 아이디' },
          contents: { type: 'string', description: '댓글 텍스트' },
          created_date: {
            format: 'date-time',
            type: 'string',
            description: '작성일',
          },
        },
        required: ['id', 'contents', 'created_date'],
      },
      CreateCommentDto: {
        type: 'object',
        properties: {
          answerId: { type: 'number', description: '답변 id' },
          contents: { type: 'string', description: '댓글 내용' },
        },
        required: ['answerId', 'contents'],
      },
      UpdateCommentDto: {
        type: 'object',
        properties: { contents: { type: 'string', description: '댓글 내용' } },
        required: ['contents'],
      },
    },
  },
};
