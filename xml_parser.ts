import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

const parser = new xml2js.Parser();

// Function to parse the XML file
function parseXML(filePath: string) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        parser.parseString(data, function (err: any, result: any) {
            if (err) {
                console.error("Error parsing XML:", err);
                return;
            }

            console.log("File parsed successfully");
            // You can now access the parsed data as a JavaScript object

            const theMainThing = result.rss.channel[0];

            //console.log(Object.keys(result.rss.channel[0]));
            /*
  'title',            'link',
  'description',      'pubDate',
  'language',         'wp:wxr_version',
  'wp:base_site_url', 'wp:base_blog_url',
  'wp:author',        'wp:category',
  'wp:tag',           'wp:term',
  'generator',        'image',
  'item'
             */
            // The keys I care about are probably 'title', 'description', and 'item'

            //Turns out it was item
            /*
            [
  'title',                'link',
  'pubDate',              'dc:creator',
  'guid',                 'description',
  'content:encoded',      'excerpt:encoded',
  'wp:post_id',           'wp:post_date',
  'wp:post_date_gmt',     'wp:post_modified',
  'wp:post_modified_gmt', 'wp:comment_status',
  'wp:ping_status',       'wp:post_name',
  'wp:status',            'wp:post_parent',
  'wp:menu_order',        'wp:post_type',
  'wp:post_password',     'wp:is_sticky',
  'wp:attachment_url',    'wp:postmeta'
]
            */

            const attributeList = result.rss.channel[0].item.filter((a: any) => ['post'].includes(a['wp:post_type'][0]));

            const filePath = 'output.txt'
            for (const attr of attributeList) {
                // In theory, this would parse the encoded HTML
                // In application, it doesn't work so great

                const encodedText: string = attr['content:encoded'][0]

                const length = encodedText.length;

                let skip = false
                for (let i = 0; i < length; i++) {

                    if (i < length - 3 && encodedText.slice(i, i + 4) === '<!--') {
                        skip = true
                    }
                    else if (i - 3 > 0 && encodedText.slice(i - 3, i) === '-->') {
                        skip = false
                    }

                    if (!skip) {
                        result += encodedText[i]
                    }
                }

                const postHtml = cheerio.load(result);

                const resultText = postHtml('*').text();

                fs.writeFileSync(filePath, resultText);
            }
        });
    });
}

// Replace with the path to your XML file
const filePath = 'mikemangione.wordpress.2024-01-12.000.xml';

// Call the function with the file path
parseXML(filePath);