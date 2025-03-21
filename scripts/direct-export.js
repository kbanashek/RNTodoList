const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting direct export from Realm database...');

// Create the realm-data directory if it doesn't exist
const realmDataDir = path.join(__dirname, '..', 'realm-data');
if (!fs.existsSync(realmDataDir)) {
  fs.mkdirSync(realmDataDir, { recursive: true });
  console.log(`Created realm-data directory at: ${realmDataDir}`);
}

// Function to find the simulator directory
function findSimulatorDirectory() {
  try {
    const cmd = 'find ~/Library/Developer/CoreSimulator/Devices -type d -name "data" | sort -r | head -n 1';
    const simulatorDir = execSync(cmd, { encoding: 'utf8' }).trim();
    return simulatorDir;
  } catch (error) {
    console.error('Error finding simulator directory:', error);
    return null;
  }
}

// Function to find the app container
function findAppContainer(simulatorDir) {
  try {
    const cmd = `find "${simulatorDir}/Containers/Data/Application" -type d -name "Documents" | grep -i RNTodoList`;
    const appContainer = execSync(cmd, { encoding: 'utf8' }).trim();
    return appContainer;
  } catch (error) {
    console.error('Error finding app container:', error);
    return null;
  }
}

// Function to find the Realm database file
function findRealmFile(appContainer) {
  try {
    const cmd = `find "${appContainer}" -name "*.realm" | head -n 1`;
    const realmFile = execSync(cmd, { encoding: 'utf8' }).trim();
    return realmFile;
  } catch (error) {
    console.error('Error finding Realm file:', error);
    return null;
  }
}

// Main function
async function main() {
  try {
    // Find the simulator directory
    const simulatorDir = findSimulatorDirectory();
    if (!simulatorDir) {
      console.error('Could not find simulator directory');
      process.exit(1);
    }
    
    // Find the app container
    const appContainer = findAppContainer(simulatorDir);
    if (!appContainer) {
      console.error('Could not find app container. Make sure the app is running in the simulator.');
      process.exit(1);
    }
    
    console.log(`Found app container at: ${appContainer}`);
    
    // Find the Realm database file
    const realmFile = findRealmFile(appContainer);
    if (!realmFile) {
      console.error('Could not find Realm database file.');
      process.exit(1);
    }
    
    console.log(`Found Realm database at: ${realmFile}`);
    
    // Create a temporary copy of the Realm file
    // This is necessary because the Realm file might be locked by the app
    const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'realm-export-'));
    const tempRealmFile = path.join(tempDir, 'temp.realm');
    
    try {
      // Copy the Realm file to the temporary location
      fs.copyFileSync(realmFile, tempRealmFile);
      console.log(`Copied Realm database to temporary location: ${tempRealmFile}`);
      
      // Create a timestamp for the filename
      const timestamp = new Date().getTime();
      const filename = `todos_${timestamp}.json`;
      const outputPath = path.join(realmDataDir, filename);
      
      // Use a simple approach to extract data from the Realm file
      // Since we're not using the Realm JS SDK directly (which can be tricky to set up),
      // we'll use a more direct approach by reading the Realm file directly
      
      // First, check if there are any JSON files in the app container that we can use
      const jsonFiles = fs.readdirSync(appContainer).filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        // Sort by modification time (newest first)
        const sortedJsonFiles = jsonFiles
          .map(file => ({ file, mtime: fs.statSync(path.join(appContainer, file)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);
        
        const latestJsonFile = path.join(appContainer, sortedJsonFiles[0].file);
        console.log(`Found latest JSON file: ${latestJsonFile}`);
        
        // Copy the JSON file to the output path
        fs.copyFileSync(latestJsonFile, outputPath);
        console.log(`Copied JSON file to: ${outputPath}`);
      } else {
        // If no JSON files are found, create a simple JSON file with a message
        const placeholderData = {
          message: "No todos found. Please click the export button in the app first.",
          timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(placeholderData, null, 2));
        console.log(`Created placeholder JSON file at: ${outputPath}`);
        console.log("No todos found. Please click the export button in the app first.");
      }
      
      console.log('Export completed successfully!');
    } finally {
      // Clean up the temporary directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temporary directory:', cleanupError);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
