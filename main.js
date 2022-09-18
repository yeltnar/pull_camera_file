const fs = require('fs/promises')

const dir = process.env.PWD;

const file_name_id = "backyard";
const extension = 'mp4';
const search_date = new Date('Sep 17 2022 19:45');

const play_file = `/tmp/ff_file_list`;

(async()=>{

    console.error(`Searching for ${search_date.toString()}`);

    let done = false;

    let pair;

    while(!done){
        try{
            await doit().then((res)=>{
                done = true;
                pair = res;
            })
        }catch(e){
            console.log(e)
            console.log('no good; waiting 10 sec and trying again - '+search_date.toString())
            await timeoutPromise(10000);
        }
    }

    await fs.writeFile(play_file, `file '${dir}/${file_name_id}_${pair.before.file}.${extension}'\n`);
    await fs.appendFile(play_file, `file '${dir}/${file_name_id}_${pair.after.file}.${extension}'\n`);

    console.log(`ffplay -f concat -safe 0 -i ${play_file}`)

})().catch((e)=>{
    console.error(e);
})


async function doit(){
    const search_date_time = search_date.getTime();

    const regex = new RegExp(`${file_name_id}_(.*).${extension}`);

    const date_arr = (await fs.readdir(dir)).filter((c)=>{
        return regex.test(c);
    }).map((c)=>{
        return c.split(regex)[1];
    }).map((c)=>{
        const a = c.split('_').join("-").split('-');
        const date = new Date(`${a[0]}-${a[1]}-${a[2]}T${a[3]}:${a[4]}:${a[5]}`);
        return {
            file: c,            
            date,
            ms: date.getTime()
        }
    });

    const pair = {
        before: null,
        after: null
    }

    for( let i=0; i<date_arr.length; i++ ){

        if(date_arr[i+1]===undefined){
            throw new Error("can't find");
        }

        if( date_arr[i].ms < search_date_time && date_arr[i+1].ms > search_date_time ){
            pair.before = date_arr[i]
            pair.after = date_arr[i+1]
            break;
        }
    }
    return pair;
}

function timeoutPromise(ms){
    return new Promise((resolve, reject)=>{
      setTimeout(resolve,ms);
    }); 
  }
  