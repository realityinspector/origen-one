#!/usr/bin/env ts-node

/**
 * Test script for Bittensor integration
 * This script tests the Bittensor client and AI service integration
 */

// Mock environment to avoid full config loading
process.env.DATABASE_URL = 'mock://test';
process.env.JWT_SECRET = 'test';
process.env.SESSION_SECRET = 'test';
process.env.LLM_PROVIDER = 'openrouter'; // Default
process.env.ENABLE_BITTENSOR_SUBNET_1 = '0'; // Default off
process.env.BITTENSOR_FALLBACK_ENABLED = '1'; // Fallback enabled

import { getLLMProvider } from '../server/services/ai';
import { ENABLE_BITTENSOR_SUBNET_1, BITTENSOR_FALLBACK_ENABLED } from '../server/config/flags';
import { LLM_PROVIDER, BITTENSOR_API_KEY } from '../server/config/env';

async function testBittensorIntegration() {
  console.log('=== Bittensor Integration Test ===\n');

  // Test 1: Provider selection
  console.log('1. Testing provider selection:');
  console.log(`   Configured provider: ${LLM_PROVIDER}`);
  console.log(`   Selected provider: ${getLLMProvider()}`);
  console.log(`   Bittensor enabled: ${ENABLE_BITTENSOR_SUBNET_1}`);
  console.log(`   Fallback enabled: ${BITTENSOR_FALLBACK_ENABLED}`);
  console.log('');

  // Test 2: Environment variables
  console.log('2. Testing environment variables:');
  console.log(`   BITTENSOR_API_KEY: ${BITTENSOR_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log('');

  // Test 3: Import test
  console.log('3. Testing imports:');
  try {
    const { askBittensor } = await import('../server/bittensor');
    const { generateLessonContent } = await import('../server/services/ai');
    console.log('   ✓ All imports successful');
  } catch (error) {
    console.log(`   ✗ Import failed: ${error}`);
  }
  console.log('');

  // Test 4: API key validation
  console.log('4. Testing Bittensor API key:');
  if (!BITTENSOR_API_KEY) {
    console.log('   ✗ BITTENSOR_API_KEY not set - skipping API test');
  } else {
    console.log('   ✓ BITTENSOR_API_KEY is set');

    // Test actual API call (commented out to avoid unnecessary API calls during testing)
    /*
    try {
      const { generateLessonContent } = await import('../server/services/ai');
      console.log('   Testing lesson generation...');
      const result = await generateLessonContent(3, 'Test Topic');
      console.log(`   ✓ Lesson generated successfully (${result.length} characters)`);
    } catch (error) {
      console.log(`   ✗ API call failed: ${error}`);
    }
    */
  }
  console.log('');

  console.log('=== Test Complete ===');
  console.log('\nTo enable Bittensor:');
  console.log('1. Set ENABLE_BITTENSOR_SUBNET_1=1');
  console.log('2. Set LLM_PROVIDER=bittensor');
  console.log('3. Configure BITTENSOR_API_KEY and wallet credentials');
  console.log('4. Optionally set BITTENSOR_FALLBACK_ENABLED=1 for automatic fallback to OpenRouter');
}

// Run the test
testBittensorIntegration().catch(console.error);
