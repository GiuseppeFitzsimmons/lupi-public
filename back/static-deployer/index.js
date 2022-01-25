const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types')
const { hashElement } = require('folder-hash');
const fetch = require('node-fetch');

async function hashFolder(folder) {
    const options = {
        //folders: { include: [folder] },
        files: { include: ['*.*'] }
    };
    let hashed = await new Promise((resolve, reject) => {
        hashElement(folder, options)
            .then(hash => {
                console.log("Temporarily logging the hash tree:", hash);
                resolve(hash);
            })
            .catch(error => {
                reject(error);
                return console.error('hashing failed:', error);
            });
    })
    return Buffer.from(hashed.hash).toString('base64');
}

async function copyTo(s3, event) {
    globalErrorMessage+="copyTo enter"
    const result = {};
    const sourceDirectory = event.ResourceProperties.SourceDirectory ? event.ResourceProperties.SourceDirectory : 'build';
    const targetBucket = event.ResourceProperties.Bucket ? event.ResourceProperties.Bucket : event.ResourceProperties.TargetBucket ? event.ResourceProperties.TargetBucket : '';
    const targetDirectory = event.ResourceProperties.TargetDirectory;
    const backupDirectory = event.ResourceProperties.BackupDirectory ? event.ResourceProperties.BackupDirectory : `backup-${targetDirectory}`;
    const tempKey = `${targetDirectory}_backup_${new Date().getTime()}`;
    if (!targetBucket || targetBucket == '' ||
        !targetDirectory || targetDirectory == '') {
        console.log("Parameters are missing. Deployment of the static files will be skipped.",
            {
                sourceDirectory: sourceDirectory,
                targetBucket: targetBucket,
                targetDirectory: targetDirectory,
                backupDirectory: backupDirectory,
            }
        );
        return result;
    }
    globalErrorMessage+="copyTo 2"
    try {
        result.Id = await hashFolder(sourceDirectory);
    } catch (hashError) {
        console.log("Error hasing",sourceDirectory, hashError);
    }
    if (!result.Id) {
        console.log("Failed to hash source directory, not copying anything");
        globalErrorMessage+="Failed to hash source directory, not copying anything";
    /*} else if (event.PhysicalResourceId && event.PhysicalResourceId == result.Id) {
        //The previous PhysicalResourceId is equal to the hash of the code, so there have been no changes.
        console.log(`event.PhysicalResourceId ${event.PhysicalResourceId} === hash ${result.Id}, so there's no call to deploy to the files`);*/
    } else {
        //First make a backup of the target, assuming it exists
        const listparams = {
            Bucket: targetBucket,
            Prefix: targetDirectory,
            MaxKeys: 1
        };
        globalErrorMessage+="copyTo 3"
        const allObjects = await s3.listObjects(listparams).promise();
        if (allObjects.Contents && allObjects.Contents.length > 0) {
            console.log("backup 1");
            await s3CopyBucketFolder(s3, targetBucket, targetDirectory, targetBucket, backupDirectory + '/' + tempKey);
            console.log("backup 2");
            await s3.deleteObject({
                Bucket: targetBucket,
                Key: targetDirectory,
            }).promise();
            console.log("backup 3");
        }
        globalErrorMessage+="copyTo 4"
        await emptyS3Directory(s3, targetBucket, targetDirectory);
        await s3CopyFolder(s3, sourceDirectory, targetBucket, targetDirectory);
    }
    return result;
}
async function cleanup(s3, event) {
    console.log("cleanup enter");
    const targetBucket = event.ResourceProperties.Bucket;
    const targetDirectory = event.ResourceProperties.TargetDirectory;
    const backupDirectory = event.ResourceProperties.BackupDirectory ? event.ResourceProperties.BackupDirectory : `backup-${targetDirectory}`;

    const allObjectsToDelete = await s3.listObjectsV2({
        Bucket: targetBucket,
        Prefix: backupDirectory + '/',
        Delimiter: '/'
    }).promise();
    if (allObjectsToDelete.CommonPrefixes && allObjectsToDelete.CommonPrefixes.length > 0) {
        _allObjectsToSort = [];
        for (_f in allObjectsToDelete.CommonPrefixes) {
            _folder = allObjectsToDelete.CommonPrefixes[_f];
            try {
                var _object = {};
                _object.key = _folder.Prefix;
                var millis = _object.key.substr(_object.key.lastIndexOf('_') + 1);
                if (millis.charAt(millis.length - 1) == '/') {
                    millis = millis.substr(0, millis.length - 1);
                }
                _object.LastModified = new Date(millis * 1);
                _allObjectsToSort.push(_object);
            } catch (e) {
                console.log("Failing to get object ", _folder.Prefix, e);
            }
        }
        _allObjectsToSort.sort((from, to) => {
            return new Date(to.LastModified).getTime() - new Date(from.LastModified).getTime();
        });
        //Now we have all backup folders in in descending date order (the latest at the top)
        //If the physicalId of this event is the same as the latest backup, then this is a rollback
        var _latestKey = '0';
        var _oldestKey = '0';
        if (_allObjectsToSort.length > 0) {
            _latestKey = _allObjectsToSort[0].key.substr(0, _allObjectsToSort[0].key.lastIndexOf('/'));
            _latestKey = _latestKey.replace(backupDirectory + '/', '');
            _oldestKey = _allObjectsToSort[_allObjectsToSort.length - 1].key.substr(0, _allObjectsToSort[_allObjectsToSort.length - 1].key.lastIndexOf('/'));
        }
        if (_latestKey == event.PhysicalResourceId) {
            console.log(_latestKey + " is equal to " + event.PhysicalResourceId + ", so this is assumed to be a rollback.");
            //copy the last backup back to the targetFolder
            await emptyS3Directory(s3, targetBucket, targetDirectory);
            await s3CopyBucketFolder(s3, targetBucket, _latestKey, targetBucket, targetDirectory);
        } else if (_oldestKey == event.PhysicalResourceId) {
            console.log(_oldestKey + " is equal to " + event.PhysicalResourceId + ", so this is assumed to be a delete everything.");
            //Actually that won't work - the oldest key will have been deleted by now.
            //On the other hand, logically then in the case of a delete all, the physical
            //ID will either equal the oldest key or won't match anything.
            //Actually, that won't work either in the case that oldest and latest are the same, meaning there's only
            //been one backup since the delete was requested.
        } else {
            var maxBackups = 2;
            if (event.ResourceProperties.MaxBackups &&
                event.ResourceProperties.MaxBackups > maxBackups &&
                !isNaN(event.ResourceProperties.MaxBackups)) {
                maxBackups = event.ResourceProperties.MaxBackups;
            }
            if (_allObjectsToSort.length > maxBackups) {
                _allObjectsToSort.splice(0, maxBackups);
            }
            for (_d in _allObjectsToSort) {
                _deletable = _allObjectsToSort[_d];
                console.log("deleting backup", _deletable);
                await emptyS3Directory(s3, targetBucket, backupDirectory, _allObjectsToSort);
            }
        }
    }
}
async function emptyS3Directory(s3, bucket, dir, exceptions) {
    const listParams = {
        Bucket: bucket,
        Prefix: dir
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (exceptions) {
        _contents = [];
        listedObjects.Contents.forEach(c => {
            _add = true;
            exceptions.forEach(ex => {
                if (c.Key.indexOf(ex.key) > -1) {
                    _add = false;
                }
            })
            if (_add) {
                _contents.push(c);
            }
        })
        listedObjects.Contents = _contents;
    }
    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir, exceptions);
}
async function recurse(currentDirPath, _array) {
    if (!_array) {
        _array=[];
    }
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            _array.push(filePath)
        } else if (stat.isDirectory()) {
            recurse(filePath, _array);
        }
    });
    return _array;
}

async function s3CopyFolder(s3, source, targetBucket, dest) {
    console.log("s3CopyFolder enter", source, targetBucket, dest);
    const pref = dest;
    const files=await recurse(source);
    console.log("Should be an array of all the files",files);
    for (let i=0;i<files.length;i++) {
        let filePath=files[i];
        let bucketPath = filePath.substring(source.length + 1);
        let params = {
            Bucket: targetBucket,
            Key: pref + '/' + bucketPath,
            Body: fs.readFileSync(filePath),
            ContentType: mime.lookup(bucketPath)
        };
        await new Promise((resolve, reject) => {
            s3.putObject(params, function (err, data) {
                if (err) {
                    console.log("s3CopyFolder error", err, bucketPath, pref+'/'+bucketPath);
                } else {
                    console.log('s3CopyFolder Successfully uploaded '+ bucketPath +' to ' + pref+'/'+bucketPath);
                }
                resolve();
            });

        });
    }
    
    console.log("s3CopyFolder done?");
}
async function s3CopyFolderOld(s3, source, targetBucket, dest) {
    console.log("s3CopyFolder enter", source, targetBucket, dest);

    function walkSync(currentDirPath, callback) {
        fs.readdirSync(currentDirPath).forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            console.log("trying to copy", filePath);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
                callback(filePath, stat);
            } else if (stat.isDirectory()) {
                walkSync(filePath, callback);
            }
        });
    }
    const pref = dest;
    await new Promise((resolve, reject) => {
        walkSync(source, function (filePath, stat) {
            let bucketPath = filePath.substring(source.length + 1);
            console.log("trying to copy", bucketPath);
            let params = {
                Bucket: targetBucket,
                Key: pref + '/' + bucketPath,
                Body: fs.readFileSync(filePath),
                ContentType: mime.lookup(bucketPath)
            };
            s3.putObject(params, function (err, data) {
                if (err) {
                    console.log("s3CopyFolder error", err, bucketPath, pref+'/'+bucketPath);
                } else {
                    console.log('s3CopyFolder Successfully uploaded '+ bucketPath +' to ' + pref+'/'+bucketPath);
                }
            });

        });
        resolve();
    })
    console.log("s3CopyFolder done?");
}
async function s3CopyBucketFolder(s3, sourceBucket, source, targetBucket, dest) {
    // sanity check: source and dest must end with '/'
    console.log("s3CopyBucketFolder", sourceBucket, source, targetBucket, dest);
    if (!source.endsWith('/')) {
        source += '/'
    }
    if (!dest.endsWith('/')) {
        dest += '/'
    }
    const listResponse = await s3.listObjectsV2({
        Bucket: sourceBucket,
        Prefix: source,
        Delimiter: '/',
    }).promise();
    // copy objects
    await Promise.all(
        listResponse.Contents.map(async (file) => {
            await new Promise((resolve, reject) => {
                s3.copyObject({
                    Bucket: targetBucket,
                    CopySource: `${sourceBucket}/${file.Key}`,
                    Key: `${dest}${file.Key.replace(listResponse.Prefix, '')}`,
                }, (err, data) => {
                    //this is non-critical, so if there's an error let it go
                    if (err) {
                        console.log(`Error backing up ${sourceBucket}/${file.Key}`);
                    }
                    resolve();
                });
            })
        }),
    );
    // recursive copy sub-folders
    await Promise.all(
        listResponse.CommonPrefixes.map(async (folder) => {
            console.log("copying", folder);
            await s3CopyBucketFolder(
                s3,
                sourceBucket,
                `${folder.Prefix}`,
                targetBucket,
                `${dest}${folder.Prefix.replace(listResponse.Prefix, '')}`,
            );
        }),
    );
    return Promise.resolve('ok');
}

async function setupWatchdogTimer(event, context, callback) {
  const timeoutHandler = async () => {
    console.log('Timeout FAILURE!')
    // Emit event to 'sendResponse', then callback with an error from this
    // function

    const answer = {
      url: event.ResponseURL,
      status: 'FAILED',
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      StackId: event.StackId,
      reason: "Timeout",
      Data: {globalErrorMessage}
    };
    await answerCloudFormation(answer)
  }

  // Set timer so it triggers one second before this function would timeout
  console.log("REMAINING TIME ", context.getRemainingTimeInMillis());
  setTimeout(timeoutHandler, context.getRemainingTimeInMillis() - 1000)
}

const answerCloudFormation = async answer => {
  console.log(`answerCloudFormation ${JSON.stringify(answer)}`);

  var params = {
    method: 'PUT',
    body: JSON.stringify({
        Status: answer.status,
        Reason: answer.reason ? answer.reason : '',
        PhysicalResourceId: answer.PhysicalResourceId,
        RequestId: answer.RequestId,
        LogicalResourceId: answer.LogicalResourceId,
        StackId: answer.StackId,
        Data: {globalErrorMessage}
      }),
  };

  let hangup=await new Promise( (resolve, reject) => {
    fetch(answer.url, params)
    .then(res => res)
    .then(function (json) {
      console.log("answer json", json);
      resolve(json);
    }).catch(err=>{
      console.log("answer error", err);
      reject(err)
    });
  });
  return hangup;
}

var globalErrorMessage='';

exports.handler = async (event, context, callback) => {
    // Install watchdog timer as the first thing
    setupWatchdogTimer(event, context, callback);
    const answer = {
      url: event.ResponseURL,
      status: 'SUCCESS',
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      StackId: event.StackId,
      Data: {globalErrorMessage}
    };
    console.log('REQUEST RECEIVED:\n' + JSON.stringify(event))
    try {
        const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        console.log('event.RequestType', event.RequestType, (event.RequestType === 'Create'))
        if (event.RequestType === 'Create') {
            console.log('CREATE!')
            var result = await copyTo(s3, event);
            console.log('CREATE! result', result)
            answer.status = result.Id ? 'SUCCESS' : 'FAILED';
            answer.reason = result.error ? result.error.message : '';
            answer.PhysicalResourceId = result.Id ? result.Id : `failed-${new Date().getTime()}`;
        } else if (event.RequestType === 'Update') {
            console.log('UDPATE!')
            //TODO if the location of the backup has changed, move everything to the new location
            var result = await copyTo(s3, event);
            answer.status = result.Id ? 'SUCCESS' : 'FAILED';
            answer.reason = result.error ? result.error.message : '';
            answer.PhysicalResourceId = result.Id ? result.Id : `failed-${new Date().getTime()}`;
        } else if (event.RequestType === 'Delete') {
            try {
                await cleanup(s3, event);
                answer.PhysicalResourceId = event.PhysicalResourceId;
                console.log("Done deleting");
            } catch (cleanupError) {
                answer.status = 'FAILED';
                answer.reason = cleanupError.error ? cleanupError.error.message : '';
                answer.PhysicalResourceId = event.PhysicalResourceId;
            }
        } else {
            console.log('FAILED!')
            answer.status = 'FAILED';
            answer.PhysicalResourceId = event.PhysicalResourceId;
        }
    } catch (error) {
        console.log('ERROR:\n', error);
        answer.status = 'FAILED';
        answer.reason = error.toString();
        answer.PhysicalResourceId = event.PhysicalResourceId;
    }
    await answerCloudFormation(answer);
}