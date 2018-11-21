# Mapping Discontent

## Background
On the 23rd June 2016 the British public voted to leave the European Union. In the immediate aftermath of the vote a Parliamentary petition was created calling for a second vote. I wanted to understand the geographical distribution of the people signing this petition in order to compare it the result of the original referendum. There were also suggestions that many of the people signing the petition may have been resident abroad, so I want to investigate this too.

The petition data was retrieved from an open government API, and combined with a constituency map of the UK. From this combination we can see that those areas where many people signed the petition are primarily those areas that voted strongly against Brexit initially. We can also see that only a relatively small number of signatures were from people resident outside the UK.

This map was put together in a couple of hours while the petition was still attracting large numbers of signatures. The total count was updated live as people were signing the petition.

## Live demo
The live demo can be found [here](https://d1h2gy52mvptjr.cloudfront.net/).

## Additional work
It would be interesting to do a detailed statistical analysis comparing the original vote with the result of th petition, to see if any areas stand out as being unusual. Unfortunately the data for the original vote are not available at the constituency level, but rather the ballots were generally counted by regions.

I have not performed any additional work to account for the differences in population in different areas of the country, however in theory this factor is accounted for by the fact that constituencies in densely populated areas are smaller that those in sparsely populated areas.
