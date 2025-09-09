# Content Moderation Assessment

A TypeScript-based content moderation system that uses Google's Gemini AI to flag problematic content before it gets posted to social media platforms.

## 🚀 Features

- **AI-Powered Content Analysis**: Uses Google Gemini LLM for intelligent content evaluation
- **Multi-Category Detection**: Identifies hate speech, harassment, violence, explicit content, misinformation, spam, self-harm, illegal activities, and terrorism
- **Severity Classification**: Categorizes content as low, medium, high, or critical severity
- **Business Rules Engine**: Applies platform-specific and confidence-based rules
- **Batch Processing**: Supports moderating multiple content items simultaneously
- **Comprehensive Testing**: Full test coverage with unit and integration tests
- **RESTful API**: Clean API endpoints for easy integration

## 🏗️ Architecture

The system follows a layered architecture:

1. **API Layer** (`src/index.ts`): Express.js server with REST endpoints
2. **Service Layer** (`src/services/`): Core business logic and AI integration
3. **Type Layer** (`src/types/`): TypeScript interfaces and type definitions
4. **Test Layer** (`src/__tests__/`): Comprehensive test suites

### Core Components

- **ContentModerator**: Main orchestration service that combines basic validation with AI analysis
- **GeminiService**: Handles communication with Google's Gemini AI API
- **Business Rules Engine**: Applies additional logic based on confidence scores and platform requirements

## 🛠️ Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd content-moderation-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📡 API Documentation

### Swagger UI

The API includes comprehensive Swagger documentation that you can access when the server is running:

**🌐 Swagger UI**: http://localhost:3000/api-docs

The Swagger interface provides:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See exact JSON structures
- **Schema Definitions**: Complete data models and validation rules
- **Authentication Info**: API key requirements and usage
- **Error Codes**: Detailed error responses and status codes
- **Real-time Testing**: Execute API calls and see live responses
- **Model Documentation**: Complete data structure definitions
- **Validation Rules**: Input requirements and constraints

### Swagger Features

#### 📋 Complete API Documentation
- All endpoints with detailed descriptions
- Request/response schemas with examples
- HTTP status codes and error responses
- Parameter descriptions and validation rules

#### 🧪 Interactive Testing
- Test API endpoints directly from the browser
- No need for external tools like Postman or cURL
- Real-time request/response viewing
- Error handling demonstration

#### 📊 Schema Validation
- Input validation rules clearly documented
- Response structure examples
- Data type specifications
- Required vs optional fields

#### 🔍 Easy Integration
- Copy-paste ready code examples
- Multiple programming language examples
- Clear integration guidelines
- Error handling patterns

### API Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T12:00:00.000Z",
  "service": "content-moderation-api"
}
```

#### Single Content Moderation
```http
POST /api/moderate
Content-Type: application/json

{
  "content": "Text to moderate",
  "userId": "optional-user-id",
  "platform": "optional-platform"
}
```

**Example Request:**
```json
{
  "content": "This is a sample text that needs to be checked for problematic content.",
  "userId": "user123",
  "platform": "twitter"
}
```

#### Batch Content Moderation
```http
POST /api/moderate/batch
Content-Type: application/json

{
  "contents": [
    {
      "content": "First text to moderate",
      "userId": "user123"
    },
    {
      "content": "Second text to moderate",
      "userId": "user456"
    }
  ]
}
```

**Example Request:**
```json
{
  "contents": [
    {
      "content": "This is a sample text that needs to be checked.",
      "userId": "user123"
    },
    {
      "content": "Another piece of content to moderate.",
      "userId": "user456"
    },
    {
      "content": "Third content item for batch processing.",
      "userId": "user789"
    }
  ]
}
```

#### Get Available Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "hate_speech",
      "description": "Content that attacks or demeans groups based on race, religion, gender, etc.",
      "severity": "high"
    },
    {
      "name": "harassment",
      "description": "Content intended to harass, bully, or intimidate",
      "severity": "high"
    }
  ],
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "isProblematic": true,
    "confidence": 0.9,
    "categories": ["hate_speech", "harassment"],
    "reasoning": "Content contains discriminatory language and harassment",
    "severity": "high",
    "recommendations": [
      "Consider using more inclusive language",
      "Please be respectful in your communication"
    ]
  },
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

## 🎯 Moderation Categories

| Category | Description | Severity |
|----------|-------------|----------|
| `hate_speech` | Content attacking groups based on protected characteristics | High |
| `harassment` | Content intended to harass, bully, or intimidate | High |
| `violence` | Content promoting or glorifying violence | Critical |
| `explicit_content` | Sexual or adult content | Medium |
| `misinformation` | False or misleading information | Medium |
| `spam` | Repetitive or promotional content | Low |
| `self_harm` | Content promoting self-harm or suicide | Critical |
| `illegal_activities` | Content promoting illegal activities | Critical |
| `terrorism` | Content promoting terrorism or extremism | Critical |

## 🔧 Algorithm Details

### 1. Basic Validation
- Empty content detection
- Length validation (max 10,000 characters)
- Spam pattern detection (repeated characters, multiple URLs, spam keywords)

### 2. AI-Powered Analysis
- Uses Google Gemini Pro model for content analysis
- Structured prompt engineering for consistent responses
- JSON response parsing with fallback handling

### 3. Business Rules Application
- Confidence threshold adjustments
- Severity-based rule enforcement
- Platform-specific modifications (e.g., YouTube age restrictions)
- Recommendation generation based on detected categories

### 4. Response Processing
- Confidence score clamping (0-1 range)
- Category validation and normalization
- Severity level enforcement
- Recommendation generation

## 🧪 Test Coverage

The project includes comprehensive test coverage:

- **Unit Tests**: Individual service testing with mocked dependencies
- **Integration Tests**: Full API endpoint testing
- **Edge Cases**: Error handling, malformed responses, and boundary conditions
- **Mock Testing**: Gemini API responses and error scenarios

### Test Categories

1. **Basic Validation Tests**: Empty content, length limits, spam patterns
2. **AI Moderation Tests**: Hate speech, violence, harassment, explicit content, misinformation
3. **Business Rules Tests**: Severity enforcement, confidence thresholds
4. **Error Handling Tests**: API failures, parsing errors, malformed responses
5. **Integration Tests**: Full API workflow testing

## 🚀 Usage Examples

### Using Swagger UI

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open Swagger UI:**
   Navigate to http://localhost:3000/api-docs in your browser

3. **Test the API:**
   - Click on any endpoint to expand it
   - Click "Try it out" button
   - Fill in the request body with your content
   - Click "Execute" to test the endpoint
   - View the response and status code

### Basic Content Moderation
```typescript
import { ContentModerator } from './services/contentModerator';
import { GeminiService } from './services/geminiService';

const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);
const moderator = new ContentModerator(geminiService);

const result = await moderator.moderateContent({
  content: "I hate all people from that country"
});

console.log(result.isProblematic); // true
console.log(result.categories); // ["hate_speech"]
console.log(result.severity); // "high"
```

### API Usage with cURL

#### Single Content Moderation
```bash
curl -X POST http://localhost:3000/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test message",
    "userId": "user123",
    "platform": "twitter"
  }'
```

#### Batch Content Moderation
```bash
curl -X POST http://localhost:3000/api/moderate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {"content": "First message", "userId": "user1"},
      {"content": "Second message", "userId": "user2"}
    ]
  }'
```

#### Get Categories
```bash
curl -X GET http://localhost:3000/api/categories
```

#### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

## 🔒 Security Considerations

- API key protection through environment variables
- Input validation and sanitization
- Rate limiting capabilities (can be added)
- CORS configuration for cross-origin requests
- Helmet.js for security headers

## 📈 Performance

- Efficient prompt engineering for faster AI responses
- Batch processing for multiple content items
- Basic validation before AI calls to reduce API usage
- Structured error handling to prevent crashes

## 🛣️ Future Enhancements

- Image and video content moderation
- Real-time streaming moderation
- Custom model fine-tuning
- Advanced caching mechanisms
- Rate limiting and throttling
- Analytics and reporting dashboard
- Multi-language support

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

**Note**: This assessment focuses on the core algorithm and content moderation logic. The implementation prioritizes accuracy, reliability, and comprehensive testing over advanced features.
